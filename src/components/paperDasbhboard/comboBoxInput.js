import React, { useState, useRef, useEffect } from 'react';

const ComboboxInput = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  label, 
  required 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    onChange(newValue);
  };

  const handleOptionClick = (option) => {
    setSearchTerm(option.label);
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-gray-600 text-sm mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700
                     placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 
                     focus:ring-blue-500 transition-colors duration-200"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 button-arrow"
          style={{width:"10%"}}
        >
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md 
                      shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {filteredOptions.map((option, index) => (
              <li
                key={index}
                className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700
                           border-b border-gray-50 last:border-b-0"
                onClick={() => handleOptionClick(option)}
              >
                <div className="flex flex-col">
                  <span>{option.label}</span>
                  {option.gsm && (
                    <span className="text-sm text-gray-500">
                      {option.gsm} GSM, {option.type}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ComboboxInput;