import React, { useState } from 'react';

const WeekPicker = ({
    value,
    onValueChange
}: {
    value: string;
    onValueChange: (value: string) => void;
}) => {

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onValueChange(event.target.value);
    };

    return (
        <div>
            <label htmlFor="week-input">Select a Week: </label>
            <input
                type="week"
                id="week-input"
                value={value}
                onChange={handleChange}
                min="2018-W18" // Optional: set a minimum week
                max="2026-W52" // Optional: set a maximum week
            />
            {value && <p>Selected Week: {value}</p>}
        </div>
    );
};

export default WeekPicker;
