import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";

// Pages
import Home from "@/pages/home";
import Organizations from "@/pages/organizations";
import OrganizationDetail from "@/pages/organization-detail";
import Donate from "@/pages/donate";
import HelpRequest from "@/pages/help";
import Transparency from "@/pages/transparency";
import DisasterRelief from "@/pages/disaster";
import Impact from "@/pages/impact";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/organizations" component={Organizations} />
        <Route path="/organizations/:id" component={OrganizationDetail} />
        <Route path="/donate" component={Donate} />
        <Route path="/help" component={HelpRequest} />
        <Route path="/transparency" component={Transparency} />
        <Route path="/disaster" component={DisasterRelief} />
        <Route path="/impact" component={Impact} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
