import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { MeshPhysicalMaterial } from 'three';

function HeadModel({ hairStyle }) {
  const { scene } = useGLTF('/head.glb'); // Placeholder GLTF head model (download/add your own)
  // Simulate hair overlay
  const hairMaterial = new MeshPhysicalMaterial({ color: hairStyle?.color || '#000000', transparent: true, opacity: 0.8 });
  // Add hair planes (simulated cards)
  return (
    <>
      <primitive object={scene} />
      <mesh position={[0, 1, 0]} material={hairMaterial}>
        <planeGeometry args={[1, 1]} /> {/* Hair card */}
      </mesh>
    </>
  );
}

const Styles = ({ user, styleCount, setStyleCount }) => {
  const [styles, setStyles] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchStyles = async () => {
      const querySnapshot = await getDocs(collection(db, 'styles'));
      setStyles(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchStyles();
  }, [db]);

  const handleSelect = async (style) => {
    if (styleCount >= 10) return alert('Subscribe for more styles!');
    setSelectedStyle(style);
    await updateDoc(doc(db, 'users', user.uid), { styleCount: styleCount + 1 });
    setStyleCount(styleCount + 1);
  };

  return (
    <div>
      <h2>Style Library</h2>
      <Link to="/import">Import External Style</Link>
      <ul>
        {styles.map(style => (
          <li key={style.id}>
            {style.name} <button onClick={() => handleSelect(style)}>Preview</button>
          </li>
        ))}
      </ul>
      {selectedStyle && (
        <Canvas style={{ height: 400 }}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <HeadModel hairStyle={selectedStyle} />
          <OrbitControls />
        </Canvas>
      )}
    </div>
  );
};

export default Styles;
