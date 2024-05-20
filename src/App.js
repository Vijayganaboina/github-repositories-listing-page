import { useEffect, useState } from 'react';
import './App.css';

function App() {
 
  const [userData, setUserData] = useState(null);    //stores the user details
  const [repos, setRepos] = useState([]);           //stores the repository details
  const [userName, setUserName] = useState('');     //store the username
  const [inputValue, setInputValue] = useState(''); //sets the input value
  const [languages, setLanguages] = useState({});   //stores the language
  const [error, setError] = useState(false);      //incorrect username usestate
  

  useEffect(() => {
    if (userName) {
      const userUrl = `https://api.github.com/users/${userName}`;
      const reposUrl = `https://api.github.com/users/${userName}/repos`;

      Promise.all([fetch(userUrl), fetch(reposUrl)])
        .then(async ([userRes, reposRes]) => {
          const userData = await userRes.json();
          const reposData = await reposRes.json();

          // Fetch languages for each repository
          const languagesPromises = reposData.map(repo =>
            fetch(repo.languages_url).then(res => res.json())
          );
          console.log(languagesPromises);
          const languagesData = await Promise.all(languagesPromises);

          // Map the language data to repository ids
          const languages = reposData.reduce((acc, repo, index) => {
            acc[repo.id] = languagesData[index];
            setError(false);
            return acc;
          }, {});

          return [userData, reposData, languages];
        })
        .then(([userData, reposData, languages]) => {
          setUserData(userData);
          setRepos(reposData);
          setLanguages(languages);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          setUserData(null);
          setRepos([]);
          setLanguages({});
          setInputValue('');
          setError(true);
        });
    }
  }, [userName]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSearch = () => {
    setUserName(inputValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
 
  return (<>
  {/* search bar */}
    <div className = {`flex flex-col items-center ${userData ? 'pt-2 w-full bg-gray-200' : 'justify-center h-screen'}`}>
      <div className={`flex flex-col rounded-lg  bg-gray-100  w-full md:w-auto ${userData ? 'px-2 py-2' : 'px-10 py-16 mb-24 shadow-2xl'}`}>
      <h2 className={`pb-3 text-bol font-thin font-mono ${userData ? 'hidden' : ''}`}>Enter your github username:</h2>
      <div className='flex justify-center items-center'>
      <i className="fa-brands fa-github text-4xl mr-1"></i>
      <input type="text" placeholder="Search..."
       value={inputValue}
       onChange={handleInputChange}
       onKeyDown={handleKeyDown}
      className="w-80 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:border-black-500" />
      <button onClick={handleSearch} className="px-4 py-2 bg-slate-700 text-white rounded-r-md hover:bg-slate-950 focus:outline-none">
      <i className="fa-solid fa-magnifying-glass"></i>
      </button>
      </div>
      <p className={`pt-2 ${error ? 'text-red-400' : 'hidden'}`}>*Enter the correct username</p>
      </div>
      </div>
    
    {userData && (
          <div className="m-auto text-center w-60 h-64 shadow-2xl rounded-2xl pt-2 mt-5 border border-t-blue-600">
            <img src={userData.avatar_url} alt="User Avatar" className="w-24 h-24 rounded-full mx-auto" />
            <p className="mt-2 text-xl font-bold">{userData.name}</p>
            <p className="font-bold text-blue-500 pb-3">@{userData.login}</p>
            <p className="text-gray-600">Following: {userData.following}</p>
            <p className="text-gray-600">Followers: {userData.followers}</p>
            <p className="text-gray-600">Public Repos: {userData.public_repos}</p>
          </div>
        )}
        {repos.length > 0 && (
          <div className="my-4">
            <h3 className="text-xl font-semibold text-center p-5 text-slate-500">Repositories:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
              {repos.map(repo => (
                <div key={repo.id} className="p-4 border rounded-lg shadow-md bg-white">
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-lg font-semibold">
                    {repo.name}
                  </a>
                  <p className="text-gray-700 mt-2">{repo.description}</p>
                  <p className="text-gray-600 mt-2 text-sm">
                    Languages: {languages[repo.id] && Object.keys(languages[repo.id]).length > 0 ? Object.keys(languages[repo.id]).join(', ') : 'No languages available'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        

    </>
    
  );
}

export default App;
