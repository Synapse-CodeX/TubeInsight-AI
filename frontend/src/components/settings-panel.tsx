import React from 'react';
import { X, Settings2, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSettings } from '@/hooks/use-analysis';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSettings } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Settings</h2>
              <p className="text-sm text-white/50">Configure analysis preferences</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/50 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Max Comments Setting */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Sliders className="w-4 h-4 text-white/50" />
              <label className="text-sm font-medium text-white">Maximum Comments to Analyze</label>
            </div>
            <div className="px-2">
              <Slider
                value={[settings.max_comments]}
                onValueChange={(value) => updateSettings({ max_comments: value[0] })}
                min={10}
                max={500}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-white/40">10</span>
                <span className="text-sm font-medium text-red-500">{settings.max_comments} comments</span>
                <span className="text-xs text-white/40">500</span>
              </div>
            </div>
            <p className="text-xs text-white/40 px-2">
              Higher values provide more comprehensive analysis but take longer to process.
            </p>
          </div>

          {/* Theme Setting */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Theme</p>
                <p className="text-xs text-white/50">Dark mode is currently the only option</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-red-600/20 text-red-500 text-xs font-medium">
                Dark
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/5">
          <Button
            onClick={onClose}
            className="w-full bg-white text-black hover:bg-white/90 font-medium"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
