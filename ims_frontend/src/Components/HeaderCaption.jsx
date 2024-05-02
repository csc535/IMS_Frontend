import React from 'react';

export const HeaderCaption = ({ mode }) => {    
    return (
        <div className="header-caption">
            <h2 className="subtitle">{mode}</h2>
        </div>
    );
};