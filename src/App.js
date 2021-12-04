import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
    return (
      <div>

        <nav class='navbar navbar-expand-lg navbar-dark bg-primary'>
          <a class='navbar-brand' href='#'>Navbar</a>
          <button class='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbarNavDropdown' aria-controls='navbarNavDropdown' aria-expanded='false'>
            <span class='navbar-toggler-icon'></span>
          </button>
          <div class='collapse navbar-collapse' id='navbarNavDropdown'>
            <ul class='navbar-nav'>
              <li class='nav-item'>
                <a class='nav-link' href='#'>Link 1</a>
              </li>
              <li class='nav-item'>
                <a class='nav-link' href='#'>Link 2</a>
              </li>
              <li class='nav-item'>
                <a class='nav-link' href='#'>Link 3</a>
              </li>
            </ul>
          </div>
        </nav>

        <div class='content'>
          <div class='vertical-split'>
            <div class='card bg-dark text-white'>
              <div class='card-header'>
                Card Title
              </div>
              <div class='card-body'>
                <p class='card-text'>Some quick example text to build on during the project</p>
                <a href='#' class='card-link'>Card link</a>
              </div>
            </div>
            <div class='card bg-dark text-white'>
              <div class='card-header'>
                Card Title
              </div>
              <div class='card-body'>
                <p class='card-text'>Some quick example text to build on during the project</p>
                <a href='#' class='card-link'>Card link</a>
              </div>
            </div>
          </div>

          <div class='vertical'>
            <div class='card bg-dark text-white'>
              <div class='card-header'>
                Card Title
              </div>
              <div class='card-body'>
                <p class='card-text'>Some quick example text to build on during the project</p>
                <a href='#' class='card-link'>Card link</a>
              </div>
            </div>
          </div>

          <div class='vertical-split'>
            <div class='card bg-dark text-white'>
              <div class='card-header'>
                Card Title
              </div>
              <div class='card-body'>
                <p class='card-text'>Some quick example text to build on during the project</p>
                <a href='#' class='card-link'>Card link</a>
              </div>
            </div>
            <div class='card bg-dark text-white'>
              <div class='card-header'>
                Card Title
              </div>
              <div class='card-body'>
                <p class='card-text'>Some quick example text to build on during the project</p>
                <a href='#' class='card-link'>Card link</a>
              </div>
            </div>
          </div>


          <div class='vertical'>
            <div class='card bg-dark text-white'>
              <div class='card-header'>
                Card Title
              </div>
              <div class='card-body'>
                <p class='card-text'>Some quick example text to build on during the project</p>
                <a href='#' class='card-link'>Card link</a>
              </div>
            </div>
          </div>


        </div>
      </div>
    );
  }
}

export default App;
