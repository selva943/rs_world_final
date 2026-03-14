import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Home } from "./pages/Home";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Rental } from "./pages/Rental";
import { Offers } from "./pages/Offers";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Admin } from "./pages/Admin";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "products", Component: Products },
      { path: "products/:id", Component: ProductDetail },
      { path: "rental", Component: Rental },
      { path: "offers", Component: Offers },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
      { path: "admin", Component: Admin },
      { path: "*", Component: NotFound },
    ],
  },
]);
