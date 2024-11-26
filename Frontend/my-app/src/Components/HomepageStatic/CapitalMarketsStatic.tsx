import React, { useState, useEffect } from 'react';
import SectionOne from './SectionOne';
import SectionTwo from './SectionTwo';
import SectionFive from './SectionFive';
import SectionFour from './SectionFour';
// import SectionThree from './SectionThree';



// Main Static Page Component
const CapitalMarketsStatic = () => {
  return (
    <div>
      <SectionOne />
      <SectionTwo />
      {/* <SectionThree /> */}
      <SectionFour />
      <SectionFive />
    </div>
  );
};

export default CapitalMarketsStatic;
