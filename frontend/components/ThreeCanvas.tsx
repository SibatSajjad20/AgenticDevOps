"use client";

export function ThreeCanvas() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#000000] overflow-hidden">
      {/* Gradient orbs - Reduced blur and removed pulse to prevent overheating */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-3xl opacity-50" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-3xl opacity-50" />
      <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-cyan-600/5 blur-3xl opacity-50" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Noise overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black pointer-events-none" />
    </div>
  );
}
