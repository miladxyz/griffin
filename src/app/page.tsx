// pages/index.tsx
import type { NextPage } from 'next';
import WebGLCandlestickChart from './components/WebGLCandlestickChart';
import 'tailwindcss/tailwind.css'
// import '../../styles/global.css'

const Home: NextPage = () => {
    return (
        <div style={{ margin: 0, padding: 0 }}>
            <WebGLCandlestickChart />
        </div>
    );
};

export default Home;
