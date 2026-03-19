import '../../assets/styles/Home.css';

function Home() {
  return (
    <section className="home-section">
      <h1 className="home-title">Dashboard Principal</h1>
      <p className="home-description">
        Bienvenido al panel de control de FinShare Analytics. 
        Aquí podrás visualizar métricas financieras, gráficos y reportes en tiempo real.
      </p>
      <div style={{ color: '#1d7e6b', fontSize: '1.1rem', marginTop: '2rem' }}>
        Próximamente: Gráficos, tablas y widgets interactivos.
      </div>
    </section>
  );
}

export default Home;

