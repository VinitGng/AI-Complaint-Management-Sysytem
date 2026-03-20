async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student@example.com", password: "student123" })
    });
    console.log(res.status);
    console.log(await res.json());
  } catch (err) {
    console.error(err);
  }
}
test();
