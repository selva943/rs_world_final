import { createBrowserRouter } from "react-router";
import { RootLayout } from "@/components/RootLayout";
import { Home } from "@/pages/Home";
import { Experiences } from "@/pages/Experiences";
import { ExperienceDetail } from "@/pages/ExperienceDetail";
import { Offers } from "@/pages/Offers";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { Admin } from "@/pages/Admin";
import { NotFound } from "@/pages/NotFound";
import ButtonTestPage from "@/pages/ButtonTest";
import SubscriptionsPage from "@/pages/Subscriptions";
import SubscriptionAdmin from "@/pages/admin/SubscriptionAdmin";
import { RecipeDiscovery } from "@/pages/RecipeDiscovery";
import { MyOrders } from "@/pages/MyOrders";
import Checkout from "@/pages/Checkout";
import PromotionManagement from "./pages/admin/PromotionManagement";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "deliverables", Component: Experiences },
      { path: "marketplace", Component: Experiences },
      { path: "recipe-kits", Component: RecipeDiscovery },
      { path: "recipes", Component: RecipeDiscovery },
      { path: "subscription", Component: SubscriptionsPage },
      { path: "subscriptions", Component: SubscriptionsPage },
      { path: "services", Component: Experiences },
      { path: "bookings", Component: Experiences },
      { path: "experience/:id", Component: ExperienceDetail },
      { path: "offers", Component: Offers },
      { path: "my-orders", Component: MyOrders },
      { path: "checkout", Component: Checkout },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
      { path: "design-system", Component: ButtonTestPage },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/admin",
    Component: Admin,
    children: [
      { path: "subscriptions", Component: SubscriptionAdmin },
      { path: "promotions", Component: PromotionManagement },
    ]
  },
]);
