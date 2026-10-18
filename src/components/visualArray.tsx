import { useState } from 'react';

// ==========================================
// TYPESCRIPT TYPES MATCHING YOUR JSON SCHEMA
// ==========================================

export interface PhaseConfig {
    id: string;
    start: number;
    length: number;
    x: number;
    y: number;
    z: number;
    xr: number;
    yr: number;
    zr: number;
    uniformscale: boolean;
    scale?: number;
    xs?: number;
    ys?: number;
    zs?: number;
}

export interface GlobalConfig {
    bgcolor: string,
    pageheight:number,
    x: number;
    y: number;
    z: number;
    xr: number;
    yr: number;
    zr: number;
    uniformscale: boolean;
    scale?: number;
    xs?: number;
    ys?: number;
    zs?: number;
    damping?: number;
    floating?: number;
    minviewportwidth?: number;
    scalewithviewport?: number;
    phases: PhaseConfig[];
}

export interface ConfigurationSchema {
    global: GlobalConfig;
}

interface ConfigEditorProps {
    onChange: (config: ConfigurationSchema) => void;
    initialConfig: ConfigurationSchema;
}

// ==========================================
// DEFAULT FACTORIES
// ==========================================

const createDefaultPhase = (index: number): PhaseConfig => ({
    id: `phase-${index + 1}`,
    start: 0,
    length: 0.5,
    x: 0,
    y: 0,
    z: 0,
    xr: 0,
    yr: 0,
    zr: 0,
    uniformscale: true,
    scale: 1,
});

export const defaultGlobalConfig: ConfigurationSchema = {
    global: {
        x: 0,
        y: 0,
        z: 0,
        xr: 0,
        yr: 0,
        zr: 0,
        uniformscale: true,
        damping: 4.5,
        scale: 1,
        phases: [],
        minviewportwidth: 0,
        bgcolor:"#222",
        pageheight:3,
    },
};

// ==========================================
// MAIN COMPONENT IMPLEMENTATION
// ==========================================

export default function ConfigEditor({
    onChange,
    initialConfig,
}: ConfigEditorProps) {
    const [config, setConfig] = useState<ConfigurationSchema>(initialConfig);

    const updateConfig = (newGlobal: GlobalConfig) => {
        const updated = { global: newGlobal };
        setConfig(updated);
        onChange(updated);
    };

    const handleGlobalChange = (field: keyof GlobalConfig, value: any) => {
        const newGlobal = { ...config.global, [field]: value };

        if (field === 'uniformscale') {
            if (value === true) {
                newGlobal.scale = newGlobal.scale ?? 1;
                delete newGlobal.xs;
                delete newGlobal.ys;
                delete newGlobal.zs;
            } else {
                newGlobal.xs = newGlobal.xs ?? 1;
                newGlobal.ys = newGlobal.ys ?? 1;
                newGlobal.zs = newGlobal.zs ?? 1;
                delete newGlobal.scale;
            }
        }

        updateConfig(newGlobal);
    };

    const handleAddPhase = () => {
        const newPhase = createDefaultPhase(config.global.phases.length);
        const updatedPhases = [...config.global.phases, newPhase];
        updateConfig({ ...config.global, phases: updatedPhases });
    };

    const handleRemovePhase = (index: number) => {
        const updatedPhases = config.global.phases.filter((_, i) => i !== index);
        updateConfig({ ...config.global, phases: updatedPhases });
    };

    const handlePhaseChange = (index: number, field: keyof PhaseConfig, value: any) => {
        const updatedPhases = config.global.phases.map((phase, i) => {
            if (i !== index) return phase;

            const newPhase = { ...phase, [field]: value };

            if (field === 'uniformscale') {
                if (value === true) {
                    newPhase.scale = newPhase.scale ?? 1;
                    delete newPhase.xs;
                    delete newPhase.ys;
                    delete newPhase.zs;
                } else {
                    newPhase.xs = newPhase.xs ?? 1;
                    newPhase.ys = newPhase.ys ?? 1;
                    newPhase.zs = newPhase.zs ?? 1;
                    delete newPhase.scale;
                }
            }

            return newPhase;
        });

        updateConfig({ ...config.global, phases: updatedPhases });
    };

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4 bg-slate-950 text-slate-100 rounded-xl font-sans">
            {/* GLOBAL SECTION */}
            <section className="p-6 border border-slate-800 rounded-xl bg-slate-900 shadow-xl space-y-6">
                <h2 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-3">
                    Global Configuration
                </h2>

                <div className="flex flex-col gap-5">
                    {/* Color */}
                    <TextInput
                    label="Color"
                    value={config.global.bgcolor}
                    onChange={(v) => handleGlobalChange('bgcolor', v)}
                    ></TextInput>
                    {/* Position */}
                    <Vector3Input
                        label="Position"
                        x={config.global.x}
                        y={config.global.y}
                        z={config.global.z}
                        step={0.1}
                        onChangeX={(v) => handleGlobalChange('x', v)}
                        onChangeY={(v) => handleGlobalChange('y', v)}
                        onChangeZ={(v) => handleGlobalChange('z', v)}
                    />

                    {/* Rotation */}
                    <Vector3Input
                        label="Rotation"
                        x={config.global.xr}
                        y={config.global.yr}
                        z={config.global.zr}
                        step={15}
                        onChangeX={(v) => handleGlobalChange('xr', v)}
                        onChangeY={(v) => handleGlobalChange('yr', v)}
                        onChangeZ={(v) => handleGlobalChange('zr', v)}
                    />

                    {/* Scale Control Toggle */}
                    <ToggleInput
                        label="Uniform Scale"
                        checked={config.global.uniformscale}
                        onChange={(v) => handleGlobalChange('uniformscale', v)}
                    />

                    {/* Conditional Scale Inputs */}
                    {config.global.uniformscale ? (
                        <NumberInput
                            label="Scale"
                            value={config.global.scale ?? 1}
                            step={0.1}
                            onChange={(v) => handleGlobalChange('scale', v)}
                        />
                    ) : (
                        <Vector3Input
                            label="Scale"
                            x={config.global.xs ?? 1}
                            y={config.global.ys ?? 1}
                            z={config.global.zs ?? 1}
                            step={0.1}
                            onChangeX={(v) => handleGlobalChange('xs', v)}
                            onChangeY={(v) => handleGlobalChange('ys', v)}
                            onChangeZ={(v) => handleGlobalChange('zs', v)}
                        />
                    )}

                    {/* Optional Controls Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <NumberInput label="Damping" min={0.1} value={config.global.damping} onChange={(v) => handleGlobalChange('damping', v)} />
                        <NumberInput label="Floating" value={config.global.floating} onChange={(v) => handleGlobalChange('floating', v)} />
                        <NumberInput label="Min Viewport Width" value={config.global.minviewportwidth} onChange={(v) => handleGlobalChange('minviewportwidth', v)} />
                        <NumberInput label="Scale with Viewport" value={config.global.scalewithviewport} onChange={(v) => handleGlobalChange('scalewithviewport', v)} />
                        <NumberInput label="Page Height" min={0} value={config.global.pageheight} onChange={(v) => handleGlobalChange('pageheight', v)} />
                    </div>
                </div>
            </section>

            {/* PHASES ARRAY SECTION */}
            <section className="p-6 border border-slate-800 rounded-xl bg-slate-900 shadow-xl space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h2 className="text-xl font-bold text-slate-100">
                        Phases ({config.global.phases.length})
                    </h2>
                    <button
                        type="button"
                        onClick={handleAddPhase}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-sm transition-all focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    >
                        + Add Phase
                    </button>
                </div>

                {config.global.phases.map((phase, index) => (
                    <div key={phase.id || index} className="p-5 border border-slate-800 rounded-xl bg-slate-950 space-y-5">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-slate-300">Phase #{index + 1}</h3>
                            <button
                                type="button"
                                onClick={() => handleRemovePhase(index)}
                                className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-medium transition-all"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <TextInput label="ID" value={phase.id} onChange={(v) => handlePhaseChange(index, 'id', v)} />
                                <NumberInput label="Start" value={phase.start} min={0} max={1} step={0.1} onChange={(v) => handlePhaseChange(index, 'start', v)} />
                                <NumberInput label="Length" value={phase.length} min={0} max={1} step={0.1} onChange={(v) => handlePhaseChange(index, 'length', v)} />
                            </div>

                            <Vector3Input
                                label="Position"
                                x={phase.x}
                                y={phase.y}
                                z={phase.z}
                                step={0.1}
                                onChangeX={(v) => handlePhaseChange(index, 'x', v)}
                                onChangeY={(v) => handlePhaseChange(index, 'y', v)}
                                onChangeZ={(v) => handlePhaseChange(index, 'z', v)}
                            />

                            <Vector3Input
                                label="Rotation"
                                x={phase.xr}
                                y={phase.yr}
                                z={phase.zr}
                                step={15}
                                onChangeX={(v) => handlePhaseChange(index, 'xr', v)}
                                onChangeY={(v) => handlePhaseChange(index, 'yr', v)}
                                onChangeZ={(v) => handlePhaseChange(index, 'zr', v)}
                            />

                            <ToggleInput
                                label="Uniform Scale"
                                checked={phase.uniformscale}
                                onChange={(v) => handlePhaseChange(index, 'uniformscale', v)}
                            />

                            {phase.uniformscale ? (
                                <NumberInput label="Scale" step={0.1} value={phase.scale ?? 1} onChange={(v) => handlePhaseChange(index, 'scale', v)} />
                            ) : (
                                <Vector3Input
                                    label="Scale"
                                    x={phase.xs ?? 1}
                                    y={phase.ys ?? 1}
                                    z={phase.zs ?? 1}
                                    step={0.1}
                                    onChangeX={(v) => handlePhaseChange(index, 'xs', v)}
                                    onChangeY={(v) => handlePhaseChange(index, 'ys', v)}
                                    onChangeZ={(v) => handlePhaseChange(index, 'zs', v)}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}

// ==========================================
// REUSABLE HELPER COMPONENTS
// ==========================================

interface Vector3InputProps {
    label: string;
    x?: number;
    y?: number;
    z?: number;
    step?:number;
    onChangeX: (v?: number) => void;
    onChangeY: (v?: number) => void;
    onChangeZ: (v?: number) => void;
}

function Vector3Input({
    label,
    x,
    y,
    z,
    step,
    onChangeX,
    onChangeY,
    onChangeZ,
}: Vector3InputProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
            <div className="flex rounded-lg shadow-sm">
                <input
                    type="number"
                    placeholder="X"
                    value={x ?? ''}
                    step={step ?? 1}
                    onChange={(e) => onChangeX(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-l-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:z-10 focus:border-indigo-500 focus:outline-none transition-colors"
                />
                <input
                    type="number"
                    placeholder="Y"
                    value={y ?? ''}
                    step={step ?? 1}
                    onChange={(e) => onChangeY(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:z-10 focus:border-indigo-500 focus:outline-none transition-colors"
                />
                <input
                    type="number"
                    placeholder="Z"
                    value={z ?? ''}
                    step={step ?? 1}
                    onChange={(e) => onChangeZ(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-r-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:z-10 focus:border-indigo-500 focus:outline-none transition-colors"
                />
            </div>
        </div>
    );
}

interface NumberInputProps {
    label: string;
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (v?: number) => void;
}

function NumberInput({ label, value, min, max, step, onChange }: NumberInputProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
            <input
                type="number"
                min={min}
                max={max}
                value={value ?? ''}
                step={step ?? 1}
                onChange={(e) => onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none transition-colors"
            />
        </div>
    );
}

interface TextInputProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
}

function TextInput({ label, value, onChange }: TextInputProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none transition-colors"
            />
        </div>
    );
}

interface ToggleInputProps {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}

function ToggleInput({ label, checked, onChange }: ToggleInputProps) {
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${checked ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-100 shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );
}