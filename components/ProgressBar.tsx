  return (
    <div className="w-full h-[6px] bg-gray-200 rounded-full overflow-hidden" aria-label="Progress Bar" aria-valuenow={progress} aria-valuemax={100} role="progressbar">
      <div
        className="h-full bg-[#004225] rounded-full transition-all duration-500 ease-in-out"
        style={{
          width: `${progress}%`,
        }}
      ></div>
    </div>
  ) 