"use strict";

const CLASS_CATALOG = [
	{ id: "yoga", name: "Yoga", price: 8, sessions: [
		{ id: "yoga-mon", label: "Monday 18:00", initialPlaces: 10 },
		{ id: "yoga-wed", label: "Wednesday 19:00", initialPlaces: 6 },
		{ id: "yoga-sat", label: "Saturday 10:00", initialPlaces: 2 }
	] },
	{ id: "pilates", name: "Pilates", price: 10, sessions: [
		{ id: "pilates-tue", label: "Tuesday 18:00", initialPlaces: 8 },
		{ id: "pilates-thu", label: "Thursday 19:00", initialPlaces: 4 },
		{ id: "pilates-sat", label: "Saturday 11:30", initialPlaces: 0 }
	] },
	{ id: "functional", name: "Functional Training", price: 12, sessions: [
		{ id: "functional-mon", label: "Monday 19:30", initialPlaces: 5 },
		{ id: "functional-wed", label: "Wednesday 18:00", initialPlaces: 10 },
		{ id: "functional-fri", label: "Friday 18:30", initialPlaces: 3 }
	] },
	{ id: "spinning", name: "Spinning", price: 11, sessions: [
		{ id: "spinning-tue", label: "Tuesday 19:30", initialPlaces: 7 },
		{ id: "spinning-thu", label: "Thursday 18:00", initialPlaces: 1 },
		{ id: "spinning-sun", label: "Sunday 10:00", initialPlaces: 10 }
	] }
];

function createInitialState() {
	return {
		remaining: Object.fromEntries(CLASS_CATALOG.flatMap(gymClass =>
			gymClass.sessions.map(session => [session.id, session.initialPlaces]))),
		draft: { classId: "", sessionId: "", participants: null },
		status: "choosing",
		reservation: null
	};
}

function getSelection(state) {
	const gymClass = CLASS_CATALOG.find(item => item.id === state.draft.classId);
	const session = gymClass?.sessions.find(item => item.id === state.draft.sessionId);
	return { gymClass, session };
}

function validateReservation(state) {
	const { gymClass, session } = getSelection(state);
	const errors = {};
	if (!gymClass) errors.classId = "Choose a class.";
	if (!session) errors.sessionId = "Choose a session for your class.";
	if (session && state.remaining[session.id] === 0) {
		errors.sessionId = "This session is full. Choose another session.";
	}
	const count = state.draft.participants;
	if (!Number.isInteger(count) || count < 1) {
		errors.participants = "Choose a whole number of participants, at least 1.";
	} else if (session && count > state.remaining[session.id]) {
		errors.participants = `Only ${state.remaining[session.id]} places remain.`;
	}
	return errors;
}

function calculateTotal(state) {
	const { gymClass } = getSelection(state);
	return gymClass && Number.isInteger(state.draft.participants)
		&& state.draft.participants > 0 ? gymClass.price * state.draft.participants : null;
}

function selectClass(state, classId) {
	if (state.status !== "choosing") return;
	state.draft = { classId, sessionId: "", participants: null };
}

function selectSession(state, sessionId) {
	if (state.status !== "choosing") return;
	state.draft.sessionId = sessionId;
	state.draft.participants = null;
}

function selectParticipants(state, participants) {
	if (state.status === "choosing") state.draft.participants = participants;
}

function confirmReservation(state) {
	if (state.status !== "choosing") return false;
	if (Object.keys(validateReservation(state)).length > 0) return false;
	const { gymClass, session } = getSelection(state);
	state.reservation = {
		className: gymClass.name,
		sessionLabel: session.label,
		participants: state.draft.participants,
		price: gymClass.price,
		total: calculateTotal(state)
	};
	state.remaining[session.id] -= state.draft.participants;
	state.status = "confirmed";
	return true;
}

function startNewReservation(state) {
	state.draft = { classId: "", sessionId: "", participants: null };
	state.reservation = null;
	state.status = "choosing";
}

function initializeApp() {
	let state = createInitialState();
	const elements = {
		form: document.getElementById("reservation-form"),
		classSelect: document.getElementById("class-select"),
		sessionSelect: document.getElementById("session-select"),
		participantsSelect: document.getElementById("participants-select"),
		confirmButton: document.getElementById("confirm-button"),
		bookingView: document.getElementById("booking-view"),
		confirmationView: document.getElementById("confirmation-view"),
		status: document.getElementById("booking-status")
	};
	const currency = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
	const touched = new Set();

	for (const gymClass of CLASS_CATALOG) {
		elements.classSelect.add(new Option(gymClass.name, gymClass.id));
	}

	function showError(field, control, message) {
		const error = document.getElementById(`${field}-error`);
		const visible = Boolean(message && touched.has(field));
		error.textContent = visible ? message : "";
		error.hidden = !visible;
		control.setAttribute("aria-invalid", String(visible));
	}

	function render() {
		const { gymClass, session } = getSelection(state);
		const errors = validateReservation(state);
		const confirmed = state.status === "confirmed";
		elements.bookingView.hidden = confirmed;
		elements.confirmationView.hidden = !confirmed;
		elements.classSelect.value = state.draft.classId;
		elements.sessionSelect.replaceChildren(new Option(gymClass ? "Select a session" : "Select a class first", ""));
		elements.sessionSelect.disabled = !gymClass;
		if (gymClass) {
			for (const item of gymClass.sessions) {
				const places = state.remaining[item.id];
				const availability = places === 0 ? "Full (0 left)" : `${places} ${places === 1 ? "place" : "places"}`;
				const [day, time] = item.label.split(" ");
				const option = new Option(`${day.slice(0, 3)} ${time} - ${availability}`, item.id);
				option.disabled = places === 0;
				elements.sessionSelect.add(option);
			}
		}
		elements.sessionSelect.value = state.draft.sessionId;
		const places = session ? state.remaining[session.id] : 0;
		elements.participantsSelect.replaceChildren(new Option(session ? "Select participants" : "Select a session first", ""));
		elements.participantsSelect.disabled = !session || places === 0;
		for (let count = 1; count <= places; count += 1) {
			elements.participantsSelect.add(new Option(`${count} ${count === 1 ? "participant" : "participants"}`, String(count)));
		}
		elements.participantsSelect.value = state.draft.participants === null ? "" : String(state.draft.participants);
		showError("class", elements.classSelect, errors.classId);
		showError("session", elements.sessionSelect, errors.sessionId);
		showError("participants", elements.participantsSelect, errors.participants);
		elements.confirmButton.disabled = confirmed || Object.keys(errors).length > 0;
		elements.status.textContent = !gymClass ? "Choose a class to begin."
			: !session ? "Choose an available session."
			: errors.sessionId || errors.participants || "Ready to confirm.";

		const total = calculateTotal(state);
		document.getElementById("summary-class").textContent = gymClass?.name || "Not selected";
		document.getElementById("summary-session").textContent = session?.label || "Not selected";
		document.getElementById("summary-participants").textContent = state.draft.participants ?? "Not selected";
		document.getElementById("summary-price").textContent = gymClass ? currency.format(gymClass.price) : "\u2014";
		document.getElementById("summary-total").textContent = total === null ? "\u2014" : currency.format(total);

		if (confirmed) {
			const booking = state.reservation;
			document.getElementById("confirmed-class").textContent = booking.className;
			document.getElementById("confirmed-session").textContent = booking.sessionLabel;
			document.getElementById("confirmed-participants").textContent = booking.participants;
			document.getElementById("confirmed-price").textContent = currency.format(booking.price);
			document.getElementById("confirmed-total").textContent = currency.format(booking.total);
			document.getElementById("remaining-status").textContent = places === 0
				? "This session is now full."
				: `${places} ${places === 1 ? "place remains" : "places remain"} in this session.`;
		}
	}

	elements.classSelect.addEventListener("change", () => {
		selectClass(state, elements.classSelect.value);
		touched.clear();
		touched.add("class");
		render();
	});
	elements.sessionSelect.addEventListener("change", () => {
		selectSession(state, elements.sessionSelect.value);
		touched.delete("participants");
		touched.add("session");
		render();
	});
	elements.participantsSelect.addEventListener("change", () => {
		const value = elements.participantsSelect.value;
		selectParticipants(state, value === "" ? null : Number(value));
		touched.add("participants");
		render();
	});
	elements.form.addEventListener("submit", event => {
		event.preventDefault();
		if (state.status !== "choosing") return;
		["class", "session", "participants"].forEach(field => touched.add(field));
		const success = confirmReservation(state);
		render();
		if (success) {
			document.getElementById("confirmation-title").focus();
		} else {
			elements.form.querySelector('[aria-invalid="true"]')?.focus();
		}
	});
	document.getElementById("new-reservation-button").addEventListener("click", () => {
		startNewReservation(state);
		touched.clear();
		render();
		elements.classSelect.focus();
	});
	window.addEventListener("pageshow", event => {
		if (event.persisted) {
			state = createInitialState();
			touched.clear();
			render();
		}
	});
	render();
}

if (typeof document !== "undefined") initializeApp();

if (typeof module !== "undefined" && module.exports) {
	module.exports = {
		CLASS_CATALOG, createInitialState, validateReservation, calculateTotal,
		selectClass, selectSession, selectParticipants, confirmReservation, startNewReservation
	};
}
