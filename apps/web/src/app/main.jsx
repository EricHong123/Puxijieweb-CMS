import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/app/App.jsx';
import '@/app/index.css';
import { LazyMotion, domAnimation } from 'framer-motion';

ReactDOM.createRoot(document.getElementById('root')).render(
	<LazyMotion features={domAnimation}>
		<App />
	</LazyMotion>
);
