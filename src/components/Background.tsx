import React from 'react';

const borderCss = "1px solid black";

const Background = (props: {w: number, h: number, top: number, left: number}) => {
  return (
    <div style={{width: props.w, height: props.h, background: "#888", position: "relative", top: props.top, left: props.left}}>
      <div style={{width: "100%", height: "25%", borderTop: borderCss, borderLeft: borderCss, borderRight: borderCss,
        position: "absolute", top: 0, left: 0}}/>

      <div style={{borderLeft: "1px dotted black", height: "100%", position: "absolute", left: "50%"}}/>

      <div style={{width: "100%", height: "25%", borderBottom: borderCss, borderLeft: borderCss, borderRight: borderCss,
        position: "absolute", bottom: 0, left: 0}}/>
    </div>
  );
};

export default Background;