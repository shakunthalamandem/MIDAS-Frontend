import React from 'react';
import HomePageVideo from '../../Assets/videos/midasvideo.mp4';

const SectionOne = () => {
  return (
    <>
      <video 
        src={HomePageVideo} // Path to your video file
        autoPlay
        loop
        muted
        style={{
          // position: 'absolute',  // Position the video behind the content
          left: 0,
          width: '100%',   // Cover the full width of the viewport
          height: '400px', // Cover the full height of the viewport
          objectFit: 'cover', // Make sure the video covers the screen without distortion
        }}
      />
      {/* Other content can be placed on top of the video here */}
    </>
  );
};

export default SectionOne;
