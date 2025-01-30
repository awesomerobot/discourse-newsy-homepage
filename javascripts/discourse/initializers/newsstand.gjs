import { apiInitializer } from "discourse/lib/api";
import NewsstandHomepage from "../components/newsstand-homepage";

export default apiInitializer("1.15.0", (api) => {
  api.renderInOutlet("custom-homepage", NewsstandHomepage);
});
