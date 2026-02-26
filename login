<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Iniciar sesión</title>

  <!-- Clerk CDN -->
  <script
    async
    crossorigin="anonymous"
    data-clerk-publishable-key="pk_test_c2V0dGxlZC1raW5nZmlzaC03NC5jbGVyay5hY2NvdW50cy5kZXYk"
    src="https://js.clerk.dev/v4/clerk.browser.js">
  </script>
</head>
<body>

  <h2>Iniciar sesión</h2>

  <!-- Aquí se mostrará el login -->
  <div id="login"></div>

  <script>
    window.addEventListener("load", async () => {
      await Clerk.load();

      if (!Clerk.user) {
        Clerk.mountSignIn(document.getElementById("login"));
      } else {
        window.location.href = "dashboard.html";
      }
    });
  </script>

</body>
</html>
