import { Button } from "@/components/ui/button";
import { Plus, Trash2, Send, Download } from "lucide-react";

export default function ButtonTestPage() {
  return (
    <div className="container mx-auto px-4 py-20 space-y-12">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-pb-green-deep">Button Variants</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="danger">Danger Button</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-pb-green-deep">Button Sizes</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <Button size="sm">Small</Button>
          <Button size="md">Medium (Default)</Button>
          <Button size="lg">Large Button</Button>
          <Button size="icon" variant="secondary"><Plus className="w-4 h-4" /></Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-pb-green-deep">States & Interactions</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button disabled>Disabled Button</Button>
          <Button loading>Loading State</Button>
          <Button variant="danger" loading>Deleting...</Button>
          <Button variant="outline" size="icon" loading />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-pb-green-deep">With Icons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button>
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="danger">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </section>
      
      <section className="p-8 bg-pb-green-soft/30 rounded-3xl border border-pb-green-soft">
        <h3 className="text-lg font-bold text-pb-green-deep mb-2">Usage Rule</h3>
        <p className="text-gray-600 text-sm">
          Always use the <code className="bg-white px-2 py-1 rounded">Button</code> component from <code className="bg-white px-2 py-1 rounded">@/app/components/ui/button</code>. 
          Never use native <code className="bg-white px-2 py-1 rounded">&lt;button&gt;</code> tags for UI actions to maintain design consistency.
        </p>
      </section>
    </div>
  );
}
