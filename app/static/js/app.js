
/* Add your Application JavaScript */


Vue.component('app-header', {
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      <a class="navbar-brand" href="#" id="photogram"><span id="camicon" class="fa fa-camera"></span> Photogram</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
    
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
              <router-link class="nav-link" to="/">Home <span class="sr-only">(current)</span></router-link>
          </li>
          <li class="nav-item active">
              <router-link class="nav-link" to="/explore">Explore <span class="sr-only">(current)</span></router-link>
          </li>
          <li class="nav-item active">
              <router-link class="nav-link" v-bind:to="'/users/'+user_id">My Profile <span class="sr-only">(current)</span></router-link>
          </li>
          <li v-if="auth" class="nav-item active">
                <router-link class="nav-link" to="/logout">Logout <span class="sr-only">(current)</span></router-link>
          </li>
          <li v-else class="nav-item active">
                <router-link class="nav-link active" to="/login">Login<router-link>
          </li>
        </ul>
      </div>
    </nav>
    `,
    watch: {
           '$route' (to, from){
               this.reload();
           }
        },
    created: function() {
        let self = this;
        self.user = localStorage.getItem('token');
        self.user_id = localStorage.getItem('user_id')
    },
    data: function() {
        return {
            user: [],
        };
    },
    methods:{
        reload(){
            let self = this;
            self.user = localStorage.getItem('token');
            self.user_id = localStorage.getItem('user_id')
        }
    }
});

Vue.component('app-footer', {
    template: `
    <footer>
        <div class="container" id="footer">
            <p>Copyright &copy; Flask Inc.</p>
        </div>
    </footer>
    `
});

const home = Vue.component('home', {
   template: `
    <div class="container" id="introdiv">
        <div class="intropic">
            <img class="introimg" src="http://www.elmens.com/wp-content/uploads/2015/02/selfie-1_-01.jpg">
        </div>
        <div class="intro">
            <h2 id="photogram"><span class="fa fa-camera"></span> Photogram</h2>
            <hr>
            <p>Share photos of your favourite moments with friends, family and the world.</p>
        <div>
        <div id="homebtns">
            <router-link class="btn btn-success"  to="/register" style="width: 200px;">Register</router-link>
            <router-link class="btn btn-primary"  to="/login" style="width: 200px;">Login</router-link>
        </div>
    </div>
   `,
    data: function() {
       return {};
    }
});

const explore = Vue.component('explore', {
    template: `
    <div v-if="messageFlag" class="explorepage">
        <router-link class="btn btn-primary" to="/posts/new">New Post</router-link>
    </div>
    <div  v-else>
        <p class="alert alert-danger"><center> OOPS! Login or register to explore <span id="photogram" >Photogram</span> !</br></center></p>
    </div>
    <router-link class="btn btn-primary" to="/posts/new">New Post</router-link>
    <div  class="container" v-if="output">
        <li v-for="resp in output"class="list">
            <div id="wrapper">
				<section class="main items">
    				<div class="post-box">
                        <p><img v-bind:src= "'/static/uploads/'+resp.photo""/><router-link v-bind:to="'/users/' +resp.user_id">{{resp.username}}</router-link></p>
    						<article class="item">
    							<p class="caption">{{resp.username}}</strong> {{resp.caption}}</p>
    						</article>
    				 </div>
				</section>
			</div>
        </li>
    </div>
    <div v-else>
        <li v-for="resp in output"class="list">
            <h5>No Posts</h5>
        </li>
    </div>
   `,
   
    watch: {
         
        'trigger' (newvalue, oldvalue){
            this.reload();
        }
      },
    created: function() {
        let self = this;
        fetch("/api/posts/", { 
            method: 'GET',
            'headers': {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'X-CSRFToken': token
            },
            credentials: 'same-origin'
        })
            .then(function (response) {
            return response.json();
            })
            .then(function (jsonResponse) {
            console.log(jsonResponse);
            if(jsonResponse.data){
                self.output = jsonResponse.data;
                self.messageFlag = true;
                self.trigger = false;
            }
            })
            .catch(function (error) {
            console.log(error);
        });
    },
    data: function() {
       return {
           output: [],
           error: [],
           messageFlag: false,
           trigger: null,
       };
    },
    methods: {
        reload(){
            let self = this;
            fetch("/api/posts/", { 
                method: 'GET',
                'headers': {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'X-CSRFToken': token
            },
            credentials: 'same-origin'
        })
            .then(function (response) {
            return response.json();
            })
            .then(function (jsonResponse) {
            console.log(jsonResponse);
            if(jsonResponse.data){
                self.output = jsonResponse.data;
                self.messageFlag = true;
                self.trigger = false;
            }
            })
            .catch(function (error) {
            console.log(error);
        });
        },
        likepost(post_id) {
            let self = this;
            fetch("/api/users/"+post_id+"/like", { 
            method: 'POST',
            'headers': {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'X-CSRFToken': token
            },
            credentials: 'same-origin'
        })
            .then(function (response) {
            return response.json();
            })
            .then(function (jsonResponse) {
            console.log(jsonResponse);
            if(jsonResponse.message){
                let message = jsonResponse.message;
                alert(message);
                self.trigger = true;
            }else if(jsonResponse.DB){
                let DB = jsonResponse.DB;
                alert(DB);
            }else{
                alert("Failed to like post");
            }
            })
            .catch(function (error) {
            console.log(error);
            });
        }
    }
});

const my_profile = Vue.component('my_profile', {
   template: `
    <div>
        <div v-if="info" class="container">
            <li v-for="user in info" class="list">
                <div class="row border-style center profile profiles-container">
                    <a href="#"><img v-bind:src= "'/static/uploads/'+user.photo" class="post_pic"></a>
                        <div class="col">
                            <h2><strong>{{user.firstname}} {{user.lastname}}</strong></h2>
                            <h5 id="pro_info"><span>{{ user.location}}</span></h5>
                            <h5 id="pro_date"><span> Member since: {{ user.joined_on}}</span></h5>
                            <h5 id="pro_info"><span>{{ user.biography}}</span></h5>
                        </div>
                    <div class="view-profile center col-3 bio">
                        </br>
                        <section class="like like_8oo9w">
                            <p class="follow_count"><span class="post_len">{{output.length}}</span><span class="follow_len">{{numberoffollower.length}}</span></p>
                        </section>
                        <section class="like like_8oo9w">
                            <p class="follow_count"><span class="follow_title">Posts</span><span class="follow_title">Followers</span></p>
                        </section>
                        <div v-if="isuser">
                        </div>
                        <div v-else class="pro-btn">
                            <div v-if="following">
                                <a class="view-btn btn-login pro-style" >Following</a>
                            </div>
                            <div v-else>
                                <a class="view-btn btn-primary pro-style" @click="follow">Follow</a>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        </div>
        <div v-else>
            <li v-for="resp in info"class="list">
                <h5>No Posts</h5>
            </li>
        </div>
        <div style="flex-direction: column; padding-bottom: 200px; padding-top: 0px;">
            <div class="imageView">
                <li v-for="pic in output" class="list li_grid">
                    <img  v-bind:src= "'/static/uploads/'+pic.photo" class="profile_post">
                </li>
            </div>
        </div>
    </div>
    `,
    watch: {
        '$route' (to, from){
            this.reload();
        },
        'following' (newvalue, oldvalue){
            this.reload();
        }
      },
    created: function() {
        let self = this;
        let user_id = this.$route.params.user_id;
        fetch("/api/users/"+user_id+"/posts", { 
            method: 'GET',
            'headers': {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'X-CSRFToken': token
            },
            credentials: 'same-origin'
        })
            .then(function (response) {
            return response.json();
            })
            .then(function (jsonResponse) {
            console.log(jsonResponse);
            if(jsonResponse.data){
                self.output = jsonResponse.data;
            }
            })
            .catch(function (error) {
            console.log(error);
        });
        fetch("/api/users/"+user_id+"/", { 
            method: 'GET',
            'headers': {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'X-CSRFToken': token
            },
            credentials: 'same-origin'
        })
            .then(function (response) {
            return response.json();
            })
            .then(function (jsonResponse) {
            console.log(jsonResponse);
            if(jsonResponse.profile){
                self.info = jsonResponse.profile;
            }
            if(jsonResponse.isuser){
                self.isuser = jsonResponse.isuser;
            }else{
                self.isuser = false;
            }
            })
            .catch(function (error) {
            console.log(error);
        });
        fetch("/api/users/"+user_id+"/followers", { 
            method: 'GET',
            'headers': {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'X-CSRFToken': token
            },
            credentials: 'same-origin'
        })
            .then(function (response) {
            return response.json();
            })
            .then(function (jsonResponse) {
            console.log(jsonResponse);
            if(jsonResponse.follower){
                self.numberoffollower = jsonResponse.follower;
            }
            })
            .catch(function (error) {
            console.log(error);
        });
        fetch("/api/users/"+user_id+"/following", { 
            method: 'GET',
            'headers': {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'X-CSRFToken': token
            },
            credentials: 'same-origin'
        })
            .then(function (response) {
            return response.json();
            })
            .then(function (jsonResponse) {
            console.log(jsonResponse);
            let follow = jsonResponse.following;
            if(follow==false){
                console.log(follow);
                self.following = false;
            }else{
                self.following = true;
            }
            })
            .catch(function (error) {
            console.log(error);
            });
    },
    data: function() {
       return {
           output:[],
           info:[],
           error: [],
           numberoffollower:[],
           following: null,
       };
    },
     methods:{
        reload(){
            let self = this;
            let user_id = this.$route.params.user_id;
            fetch("/api/users/"+user_id+"/posts", { 
                method: 'GET',
                'headers': {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'X-CSRFToken': token
                },
                credentials: 'same-origin'
            })
                .then(function (response) {
                return response.json();
                })
                .then(function (jsonResponse) {
                console.log(jsonResponse);
                if(jsonResponse.data){
                    self.output = jsonResponse.data;
                }
                })
                .catch(function (error) {
                console.log(error);
            });
            fetch("/api/users/"+user_id+"/", { 
                method: 'GET',
                'headers': {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'X-CSRFToken': token
                },
                credentials: 'same-origin'
            })
                .then(function (response) {
                return response.json();
                })
                .then(function (jsonResponse) {
                console.log(jsonResponse);
                if(jsonResponse.profile){
                    self.info = jsonResponse.profile;
                }
                if(jsonResponse.isuser){
                    self.isuser = jsonResponse.isuser;
                }else{
                    self.isuser = false;
                }
                })
                .catch(function (error) {
                console.log(error);
            });
            fetch("/api/users/"+user_id+"/followers", { 
            method: 'GET',
            'headers': {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'X-CSRFToken': token
            },
            credentials: 'same-origin'
        })
            .then(function (response) {
            return response.json();
            })
            .then(function (jsonResponse) {
            // display a success message
            console.log(jsonResponse);
            if(jsonResponse.follower){
                self.numberoffollower = jsonResponse.follower;
            }
            })
            .catch(function (error) {
            console.log(error);
        });
        fetch("/api/users/"+user_id+"/following", { 
            method: 'GET',
            'headers': {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'X-CSRFToken': token
            },
            credentials: 'same-origin'
        })
            .then(function (response) {
            return response.json();
            })
            .then(function (jsonResponse) {
            console.log(jsonResponse);
            let follow = jsonResponse.following;
            if(follow==false){
                console.log(follow);
                self.following = false;
            }else{
                self.following = true;
            }
            })
            .catch(function (error) {
            console.log(error);
            });
        },
        follow(){
            let self = this;
            let user_id = this.$route.params.user_id;
            fetch("/api/users/"+user_id+"/follow", { 
            method: 'POST',
            'headers': {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'X-CSRFToken': token
            },
            credentials: 'same-origin'
            })
            .then(function (response) {
            return response.json();
            })
            .then(function (jsonResponse) {
            console.log(jsonResponse);
            if(jsonResponse.message){
                let message = jsonResponse.message;
                alert(message);
                self.following = true;
            }else{
                alert("Failed to follow user");
            }
            })
            .catch(function (error) {
            console.log(error);
            });
        }
    }
});

const logout = Vue.component('logout', {
   template: `<div></div>`,
    created: function() {
        let self = this;
        fetch("/api/auth/logout", { 
            method: 'GET',
            'headers': {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(function (response) {
            return response.json();
            })
            .then(function (jsonResponse) {
            console.log(jsonResponse);
            let message = jsonResponse.message;
            if(jsonResponse.message){
                localStorage.removeItem('token');
                localStorage.removeItem('user_id');
                alert (message);
                self.$router.push('/');
                
            }
            })
            .catch(function (error) {
            console.log(error);
        });
    },
    methods: {
    }
});

const login = Vue.component('login', {
   template: `
    <div class="userlogin">
        <h3 id="logtitle">Login</h3>
        <div >
            <ul id="message" class="list">
                <li v-for="resp in error" class="list alert alert-danger">
                    {{resp.errors[0]}} <br>
                    {{resp.errors[1]}} <br>
                </li>
            </ul>
            <form id="loginform" @submit.prevent="userlogin" method="POST" >
                <div>
                    <div>
                        <div class="form-group">
                            <label class="label_bold" for="msg"> Username </label>
                            <input type='text' id='usrname' name='username' class="form-control"/>
                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        <div class="form-group">
                            <label class="label_bold" for="msg"> Password </label>
                            <input type='password' id='passwd' name='password' class="form-control"/>
                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        <button id="submit" class="btn btn-success">Login</button>
                    </div>
                </div>
            </form>
         </div>
    </div>
    `,
    data: function() {
       return {
           response: [],
           error: []
       };
    },
    methods: {
            userlogin: function () {
            let self = this;
            let loginforms = document.getElementById('loginform');
            let formData = new FormData(loginforms);
            fetch("/api/auth/login", { 
                method: 'POST', 
                body: formData,
                headers: {
                    'X-CSRFToken': token
                },
                credentials: 'same-origin'
            })
                .then(function (response) {
                return response.json();
                })
                .then(function (jsonResponse) {
                console.log(jsonResponse);
                if(jsonResponse.errors){
                    self.error = jsonResponse.errors;
                } else{
                    let jwt_token = jsonResponse.data.token;
                    let user_id = jsonResponse.data.user_id;
                    localStorage.setItem('token', jwt_token);
                    localStorage.setItem('user_id', user_id);
                    self.$router.push('/explore');
                }
                })
                .catch(function (error) {
                console.log(error);
            });
        }
    }
});


const register = Vue.component('register-form', {
   template: `
    <div>
        <h3 id="regtitle">Register</h3>
        <div>
             <ul id="message" class="list">
                 <li v-for="resp in error"class="list alert alert-danger">
                    {{resp.errors[0]}} <br>{{resp.errors[1]}} <br>
                    {{resp.errors[2]}} <br>{{resp.errors[3]}} <br>
                    {{resp.errors[4]}} <br>{{resp.errors[5]}} <br>
                    {{resp.errors[6]}} <br>{{resp.errors[7]}} <br>
                   
                </li>
            </ul>
        </div>
        <div>
            <form id="signupForm"  @submit.prevent="registeruser" method="POST" enctype="multipart/form-data">
            
                <label>Username</label></br>
                <input type="text" id="uname" name ="username"/></br></br>
                
                <label>Password</label></br>
                <input type="password" id="pword" name ="password"/></br></br>
                
                <label>Firstname</label></br>
                <input type="text" id="fname" name ="firstname"/></br></br>
                
                <label>Lastname</label></br>
                <input type="text" id="lname" name ="lastname"/></br></br>
                
                <label>Email</label></br>
                <input type="text" id="f_email"  placeholder="e.g. jane@example.com" name ="email"/></br></br>
                
                <label>Location</label></br>
                <input type="text" id="f_location" placeholder="e.g. Kingston, Jamaica" name ="location"/></br></br>
                
                <label>Biography</label></br>
                <textarea  id="bio" name ="biography"></textarea></br></br>
                
                <label>Photo</label></br>
                <input type="file" name="image"/></br></br>
                
                <div>
                    <button id="regbtn" class="btn btn-success" type="submit">Register</button>
                </div>
            
            </form>
        </div>
        
    
    </div>
    
   `,
    data: function() {
       return {
           response:[],
           error:[] 
       };
    },
    methods:{
        registeruser: function(){
            let self = this;
            let signupForm = document.getElementById('signupForm');
            let form_data = new FormData(signupForm);
            fetch("/api/users/register",{
                method: 'POST',
                body: form_data,
                headers: {
                    'X-CSRFToken': token
                },
                credentials: 'same-origin'
            })
            .then(function (response) {
                return response.json();
                })
                .then(function (jsonResponse) {
                console.log(jsonResponse);
                if(jsonResponse.result){
                    alert("Registration complete!");
                    self.$router.push('/');
                }else if(jsonResponse.errors){
                    self.error = jsonResponse.errors;
                }
                })
                .catch(function (error) {
                console.log(error);
            });
        }
    }
            
});

const post = Vue.component('post', {
   template: `
    <div class="fix-register">
    <div class="layout border-style">
        <ul id = "message">
            <li v-for="resp in response" class="list alert alert-success">
                      {{ resp.message }}
            </li>
            <li v-for="resp in error"class="list alert alert-danger">
                {{resp.errors[0]}} <br>
                {{resp.errors[1]}} <br>
            </li>
        </ul>
          <form id="postforms" @submit.prevent="makePost" method="POST" >
              <p class="label_bold">Photo</p>
                    <div class="row photo">
                        <div class="upload-btn-wrapper">
                            <button id="btn">Browse</button>
                            <input type="file" name="photo"/>
                        </div>
                    </div>
              <div class="row">
                    <div class="col-md-11">
                        <div class="form-group">
                              <label class="label_bold" for="msg">Caption </label>
                              <textarea type='text' id='usrname' name='caption' placeholder="Write a caption..."class="form-control"/></textarea>
                        </div>
                    </div>
              </div>
              <div class="row">
                  <div class="col-md-11">
                      <button id="submit" class="btn btn-login">Submit</button>
                  </div>
              </div>
          </form>
      </div>
      </div> `,
    data: function() {
       return {
           response:[],
           error:[]
       };
    },
    methods: {
        makePost: function () {
            let self = this;
            let loginforms = document.getElementById('postforms');
            let formData = new FormData(loginforms);
            let user_id = localStorage.getItem('user_id');
            fetch("/api/users/"+user_id+"/posts",{
                method: 'POST',
                body: formData,
                'headers':{
                    'Authorization': 'Bearer' + localStorage.getItem('token'),
                    'X-CSRFToken': token
                },
                credentials: 'same origin'
            })
            .then(function (response) {
                return response.json();
                })
                .then(function (jsonResponse) {
                console.log(jsonResponse);
                if(jsonResponse.message){
                    let message = jsonResponse.message;
                    alert(message);
                    self.$router.push('/explore');
                } else{
                    self.error = jsonResponse.errors;
                }
                })
                .catch(function (error) {
                console.log(error);
            });
        }
            
    }
});



Vue.use(VueRouter);

// Define Routes
const router = new VueRouter({
    routes: [
        { 
            path: "/", 
            component: home 
            
        },
        {
            path: "/explore",
            component: explore
        },
        {
            path: "/users/{user_id}",
            component: my_profile
        },
        {
            path: "/logout",
            component: logout
        },
        {
            path:"/login",
            component: login
        },
        {
            path:"/register",
            component: register
        },
        {
            path:"/posts/new",
            component: post
        },
        
       
    ]
});

// Instantiate our main Vue Instance
let app = new Vue({
    el: "#app",
    router
});