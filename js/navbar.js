let navbar=document.getElementById("navbar");
navbar.innerHTML=`

          <nav class="container navbar navbar-expand-lg navbar-light  ">
        <a class="navbar-brand text-info mr-4"
          style="margin-top:-10px;font-size:23px" href="index.html"><img src="imgs/OIP.jpg"
          style=" width:105px; max-height: 40px;" alt></a>
          
          <li class="nav-item">
              <a class="nav-link text-light" style="margin-left:-30px"
              href="cart.html" id="cartCounter"></a>
            </li>
            
            <button class="navbar-toggler" type="button" data-toggle="collapse"
            data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent" aria-expanded="false"
          aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav">
        </ul>
        
        <form action="search.html" method="get" class="ml-auto">
            <div class="m-auto "
            style="width:315px ; background-color: white; border-radius: 20px;border:solid 3px gray ;padding-left:5px">
            <label for="search"><i
                class="fa-solid fa-magnifying-glass text-dark"></i></label>
                <input type="text" id="search" name="search" class="search search-input"
                style="width:65%;" placeholder="Search for products here">
                <input type="submit" class="btn btn-info "
                style="border-radius: 20px; margin-top:-5px;">
            </div>
        </form>
        
    </div>
    
</nav>

`;





let footer = document.getElementById("footer");
footer.innerHTML = `
    
            <div
                class="text-dark text-center bg-light h6 p-3 mt-5 mb-0">Developed
                By
                <a
                    href="https://www.instagram.com/bdljwd478?igsh=MXNlNWJsaWJtb3A5cA=="
                    target="_blank" class='text-primary'>Mohammed Abdelgawad</a>
            </div>

`;