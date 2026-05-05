import HomePage from "./pages/HomePage";
import CompanyRegisterPage from "./pages/CompanyRegisterPage";

function App() {
  const currentPath = window.location.pathname;

  if (
    currentPath === "/cadastro-instituicao" ||
    currentPath === "/cadastro-empresa"
  ) {
    return <CompanyRegisterPage />;
  }

  return <HomePage />;
}

export default App;
