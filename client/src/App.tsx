import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Editor from "@/pages/Editor";
import Tools from "@/pages/Tools";
import ResizeTool from "@/pages/tools/ResizeTool";
import CropTool from "@/pages/tools/CropTool";
import ConvertTool from "@/pages/tools/ConvertTool";
import RotateTool from "@/pages/tools/RotateTool";
import AdjustTool from "@/pages/tools/AdjustTool";
import CompressTool from "@/pages/tools/CompressTool";
import WatermarkTool from "@/pages/tools/WatermarkTool";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/editor" component={Editor} />
      <Route path="/tools" component={Tools} />
      <Route path="/tools/resize" component={ResizeTool} />
      <Route path="/tools/crop" component={CropTool} />
      <Route path="/tools/convert" component={ConvertTool} />
      <Route path="/tools/rotate" component={RotateTool} />
      <Route path="/tools/adjust" component={AdjustTool} />
      <Route path="/tools/compress" component={CompressTool} />
      <Route path="/tools/watermark" component={WatermarkTool} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
