/**
 * Root App component
 * Sets up the main application structure
 */

import GistContainer from './components/GistContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/global.css';

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <GistContainer />
      </ErrorBoundary>
    </div>
  );
}

export default App;
