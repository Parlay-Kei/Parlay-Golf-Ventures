  <label
    htmlFor={id}
    className="block text-[12px] uppercase font-medium font-['Inter'] text-[#1D1F1D] mb-1 tracking-tight"
  >
    {label}
  </label>
  <input
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full h-12 px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-300'} 
               rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#004225]/30 
               focus:border-[#004225] transition-all duration-200 font-['Inter']`}
  /> 