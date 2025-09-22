'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function ThemesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-card-foreground">
          Theme Toggle Showcase
        </h1>
        <p className="text-muted-foreground">
          Explore different variants of our beautiful theme toggle components
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Button Variant */}
        <Card>
          <CardHeader>
            <CardTitle>Button Variant</CardTitle>
            <p className="text-sm text-muted-foreground">
              Simple button that cycles through themes
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <ThemeToggle variant="button" size="sm" />
              <ThemeToggle variant="button" size="md" />
              <ThemeToggle variant="button" size="lg" />
            </div>
            <div>
              <ThemeToggle variant="button" size="md" showLabels />
            </div>
          </CardContent>
        </Card>

        {/* Dropdown Variant */}
        <Card>
          <CardHeader>
            <CardTitle>Dropdown Variant</CardTitle>
            <p className="text-sm text-muted-foreground">
              Modern dropdown with glassmorphism design
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <ThemeToggle variant="dropdown" size="sm" />
              <ThemeToggle variant="dropdown" size="md" />
              <ThemeToggle variant="dropdown" size="lg" />
            </div>
            <div>
              <ThemeToggle variant="dropdown" size="md" showLabels />
            </div>
          </CardContent>
        </Card>

        {/* Segmented Control */}
        <Card>
          <CardHeader>
            <CardTitle>Segmented Control</CardTitle>
            <p className="text-sm text-muted-foreground">
              iOS-inspired segmented control design
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <ThemeToggle variant="segmented" size="sm" />
              <ThemeToggle variant="segmented" size="md" />
              <ThemeToggle variant="segmented" size="lg" />
            </div>
            <div>
              <ThemeToggle variant="segmented" size="md" showLabels />
            </div>
          </CardContent>
        </Card>

        {/* Minimal Variant */}
        <Card>
          <CardHeader>
            <CardTitle>Minimal Variant</CardTitle>
            <p className="text-sm text-muted-foreground">
              Clean and minimal design for tight spaces
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-6">
              <ThemeToggle variant="minimal" size="sm" />
              <ThemeToggle variant="minimal" size="md" />
              <ThemeToggle variant="minimal" size="lg" />
            </div>
            <div className="flex items-center space-x-6">
              <ThemeToggle variant="minimal" size="sm" showLabels />
              <ThemeToggle variant="minimal" size="md" showLabels />
              <ThemeToggle variant="minimal" size="lg" showLabels />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards Variant - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle>Cards Variant</CardTitle>
          <p className="text-sm text-muted-foreground">
            Detailed cards showing all available themes with previews
          </p>
        </CardHeader>
        <CardContent>
          <ThemeToggle variant="cards" />
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <p className="text-sm text-muted-foreground">
            Copy and paste these examples into your components
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-medium text-card-foreground">Basic Button</h4>
            <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
              <code>{`<ThemeToggle variant="button" />`}</code>
            </pre>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-card-foreground">Dropdown with Labels</h4>
            <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
              <code>{`<ThemeToggle variant="dropdown" showLabels size="md" />`}</code>
            </pre>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-card-foreground">Segmented Control</h4>
            <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
              <code>{`<ThemeToggle variant="segmented" size="lg" />`}</code>
            </pre>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-card-foreground">Cards Grid</h4>
            <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
              <code>{`<ThemeToggle variant="cards" />`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Note about Floating Variant */}
      <Card className="bg-gradient-to-br from-primary/5 to-chart-2/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 animate-pulse" />
            <div>
              <h4 className="font-semibold text-primary mb-2">
                Floating Variant Available
              </h4>
              <p className="text-sm text-muted-foreground">
                The floating variant creates a fixed position theme selector in the bottom-right corner. 
                Add <code className="bg-primary/10 px-1 rounded text-primary">variant=&quot;floating&quot;</code> to try it out!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}