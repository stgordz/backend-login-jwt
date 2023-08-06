const registerForm = document.querySelector("#registerForm");

registerForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	const data = new FormData(registerForm);
	const obj = {};
	data.forEach((value, key) => (obj[key] = value))

	await fetch("/api/sessions/register", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(obj)
	}).then(res => {
		if (res.status !== 200) {
			alert(`Invalid credentials`);
		} else {
			alert(`Created`);
			window.location.replace("/");
		};
	}).catch(err => {return `Catch error: ${err}`});
});