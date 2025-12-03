import React, { useState } from 'react';

export default function ImportStyle() {
  const [img, setImg] = useState(null);

  return (
    <div style={{textAlign:'center', padding:'3rem'}}>
      <h2>StyleSnap & Import</h2>
      <p>Upload any hairstyle photo</p>
      <input type="file" accept="image/*" onChange={(e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          setImg(reader.result);
          setTimeout(() => alert("Style Imported! Added to your library"), 2000);
        };
        reader.readAsDataURL(file);
      }} />
      {img && <img src={img} style={{maxWidth:'100%', marginTop:'1rem', borderRadius:'12px'}} />}
    </div>
  );
}
