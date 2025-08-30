import "./css/Header.css";
import projectLogo from './assets/projectLogo.png';

function createSearchPage() {
    return(
    <>
        <div className="searchHeader">
            <img className="projectLogo" src={projectLogo} alt="logo"/>
            <h1 className="projectTitle">Find Your Image</h1>
            <button className="darkModeButton">Dark Mode</button>
        </div>
    </>
);
}

export default createSearchPage;
