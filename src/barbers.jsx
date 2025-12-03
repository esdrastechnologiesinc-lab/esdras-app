import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const libraries = ['places'];

const Barbers = ({ user }) => {
  const [barbers, setBarbers] = useState([]);
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // Default SF
  const [searchBox, setSearchBox] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchBarbers = async () => {
      const querySnapshot = await getDocs(collection(db, 'barbers'));
      setBarbers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchBarbers();
    navigator.geolocation.getCurrentPosition(pos => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
  }, [db]);

  const onPlacesChanged = () => {
    const places = searchBox.getPlaces();
    if (places.length > 0) setCenter({ lat: places[0].geometry.location.lat(), lng: places[0].geometry.location.lng() });
  };

  return (
    <div>
      <h2>Find Barbers</h2>
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_API_KEY" libraries={libraries}>
        <StandaloneSearchBox onLoad={ref => setSearchBox(ref)} onPlacesChanged={onPlacesChanged}>
          <input type="text" placeholder="Search location" />
        </StandaloneSearchBox>
        <GoogleMap mapContainerStyle={{ height: '400px' }} center={center} zoom={10}>
          {barbers.map(barber => (
            <Marker key={barber.id} position={{ lat: barber.lat, lng: barber.lng }} />
          ))}
        </GoogleMap>
      </LoadScript>
      <ul>
        {barbers.map(barber => (
          <li key={barber.id}>
            {barber.name} - {barber.specialty} <Link to={`/booking/${barber.id}`}>Book</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Barbers;
