<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Iniciar sesión</title>

  <!-- Clerk personalizado -->
  <script
    async
    crossorigin="anonymous"
    data-clerk-publishable-key="pk_test_c2V0dGxlZC1raW5nZmlzaC03NC5jbGVyay5hY2NvdW50cy5kZXYk"
    src="https://settled-kingfish-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js"
    type="text/javascript">
  </script>
</head>
<body>

  <h2>Iniciar sesión</h2>

  <!-- Div donde se montará el login -->
  <div id="login"></div>

  <script>
    window.addEventListener("load", async () => {
      // Inicializar Clerk usando la instancia personalizada
      const clerk = await Clerk.load({ 
        frontendApi: "pk_test_c2V0dGxlZC1raW5nZmlzaC03NC5jbGVyay5hY2NvdW50cy5kZXYk" 
      });

      // Montar el login
      clerk.mountSignIn(document.getElementById("login"));
    });
  </script>

</body>
</html>
