
/* Add your Application JavaScript */

/* -----------------------HEADER---------------------- */
Vue.component('app-header', {
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      <a class="navbar-brand" href="#" id="photogram"><span id="camicon" class="fa fa-camera"></span> Photogram</a>
      <button id="navbut" class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
    
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item active" >
              <router-link class="nav-link" to="/">Home <span class="sr-only">(current)</span></router-link>
          </li>
          <li class="nav-item active">
              <router-link class="nav-link" to="/explore">Explore <span class="sr-only">(current)</span></router-link>
          </li>
          <li class="nav-item active">
              <router-link class="nav-link" v-bind:to="'/users/'+userid">My Profile <span class="sr-only">(current)</span></router-link>
          </li>
          <li  class="nav-item active" v-if="user">
                <router-link class="nav-link" to="/logout/">Logout <span class="sr-only">(current)</span></router-link>
          </li>
          <li v-else class="nav-item">
              <router-link class="nav-link active" to="/login">Login <span class="sr-only">(current)</span></router-link>
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
        self.userid = localStorage.getItem('userid')
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
            self.userid = localStorage.getItem('userid')
        }
    }
});


/* -----------------------FOOTER---------------------- */
Vue.component('app-footer', {
    template: `
    <footer>
        <div class="container" id="footer">
            <p>Copyright &copy; Flask Inc.</p>
        </div>
    </footer>
    `
});


/* -----------------------HOME---------------------- */
const home = Vue.component('home', {
   template: `
    <div class="container" id="introdiv">
        <div class="intropic">
            <img class="introimg" src="/static/images/selfie.jpg"/>
        </div>
        <div class="intro">
            <h2 id="photogram"><span class="fa fa-camera"></span> Photogram</h2>
            <hr>
            <p>Share photos of your favourite moments with friends, family and the world.</p>
        
        <div id="homebtns">
            <router-link class="btn btn-success"  to="/register" style="width: 200px">Register</router-link>
            <router-link class="btn btn-primary"  to="/login" style="width: 200px;">Login</router-link>
        </div>
        </div>
    </div>
   `,
    data: function() {
       return {};
    }
});

/* -----------------------REGISTER---------------------- */
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
                    self.$router.push('/login');
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



/* -----------------------LOGIN---------------------- */
const login = Vue.component('login-form', {
   template: `
    <div>
        <h3 id="logtitle">Login</h3>
        <div >
            <ul id="message" class="list">
                <li v-for="resp in error" class="list alert alert-danger">
                    {{resp.errors[0]}} <br>
                    {{resp.errors[1]}} <br>
                </li>
            </ul>
            <ul id="message" class="list">
                <div v-if ="messageFlag">
                    <div v-if="merror" class="list alert alert-danger">
                        {{merror}}
                    </div>
                </div>
            </ul>
            <form id="loginform" @submit.prevent="userlogin" method="POST" >
               
                <div class="form-group">
                    <label class="label_bold" for="msg"> Username </label>
                    <input type='text' id='usrname' name='username' class="form-control"/>
                </div>
                
                <div class="form-group">
                    <label class="label_bold" for="msg"> Password </label>
                    <input type='password' id='passwd' name='password' class="form-control"/>
                </div>
                
                <div>
                    <button id="submit" class="btn btn-success">Login</button>
                </div>
                
            </form>
         </div>
    </div>
    `,
    data: function() {
       return {
           response: [],
           error: [],
           merror: [],
           messageFlag: false,
       };
    },
    methods: {
            userlogin: function () {
            let self = this;
            let loginforms = document.getElementById('loginform');
            let form_data = new FormData(loginforms);
            fetch("/api/auth/login", { 
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
                if(jsonResponse.errors){
                    self.error = jsonResponse.errors;
                } 
                else if(jsonResponse.errorm)
                {
                    let emessage = jsonResponse.errorm;
                    self.merror = emessage;
                    self.messageFlag = true;
                }
                else{
                    let jwt_token = jsonResponse.data.token;
                    let userid = jsonResponse.data.userid;
                    localStorage.setItem('token', jwt_token);
                    localStorage.setItem('userid', userid);
                    if(jsonResponse.data){
                        alert("User successfully logged in!");
                        self.$router.push('/explore');
                    }
                }
                })
                .catch(function (error) {
                console.log(error);
            });
        }
    }
});


/* -----------------------EXPLORE---------------------- */
const explore = Vue.component('explore-form', {
   template: `
   
    <div v-if="messageFlag" class="explorepage">
        <router-link id="postbut" class="btn btn-primary" to="/posts/new">New Post</router-link>
        <div class="container" v-if="postlist">
            <div id="postdiv" v-for="resp in postlist">
                <p id="postprofile" ><img v-bind:src= "'/static/uploads/'+resp.image"style="width: 5rem; height: 5rem; padding: 10px; border-radius:100px;"/> <router-link id="uname" v-bind:to="'/users/' +resp.user_id">{{resp.username}}</router-link></p>
    			<img id="postpic" v-bind:src= "'/static/uploads/'+resp.postimage" />
    			<p class="caption">{{resp.caption}}</p>
    			<section id="likediv">
    				<div v-if="resp.likeflag">
                        <a id="postlike"  @click="likepost(resp.post_id)" ><span id="selfheart" class="fa fa-heart" ></span> {{resp.likes.length}} Likes</a>
                        <a><span id="postdate" class="span_8scx2">{{resp.created_on}}</span></a>
                    </div>
                    <div v-else>
                        <a id="postlike" @click="likepost(resp.post_id)"><span id="heart" class="fa fa-heart"></span> {{resp.likes.length}} Likes</a>
                        <a><span id="postdate" >{{resp.created_on}}</span></a>
                    </div>
                 </section>
            </div>
        </div>
    
        <div v-else >
            <li v-for="resp in postlist">
                <h5>No Posts</h5>
            </li>
        </div>
    </div>
    <div  v-else>
        <p class="alert alert-danger"><center> OOPS! Login or register to explore <span id="photogram" >Photogram</span> !</br></center></p>
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
            // display a success message
            console.log(jsonResponse);
            
            if(jsonResponse.data){
                self.postlist = jsonResponse.data;
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
           postlist: [],
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
            // display a success message
            console.log(jsonResponse);
            if(jsonResponse.data){
                self.postlist = jsonResponse.data;
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
            // display a success message
            console.log(jsonResponse);
            if(jsonResponse.message){
                let message = jsonResponse.message;
                self.trigger = true;
                // alert(message);
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

/* -----------------------PROFILE---------------------- */
const myprofile = Vue.component('profile-form', {
  template: `
    <div>
        <div v-if="info">
            <div v-for="user in info">
                <div id="userdiv">
                   <table style="width:100%">
                        <tr>
                            <td width="20%">
                                <a href="#"><img id="proimage" v-bind:src= "'/static/uploads/'+user.image"></a>
                            </td>
                            
                            <td width="55%">
                                <h4><strong>{{user.firstname}} {{user.lastname}}</strong></h4></br>
                                <p id="pro">{{ user.location}}</br> Member since {{ user.joined_on}}</br></br>{{ user.biography}}</p>
                            </td>
                    
                            <td width="25%" style="padding-left:50px">
                                <div id="postlength">
                                    <p><strong>{{output.length}}</strong></p>
                                    <p><span id="butlabels">Posts</span></p>
                                </div>
                                <div id="folllength">
                                    <p><strong>{{numberoffollower.length}}</strong></p>
                                    <p><span id="butlabels">Followers</span></p>
                                </div>
                                <div width="25%" v-if="isuser">
                                
                                    <div v-if="following">
                                        <button id="follbut" class="btn btn-success" >Following</button>
                                    </div>
                                    <div v-else>
                                        <button id="follbut" class="btn btn-primary" @click="follow">Follow</button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        <div v-else>
            <div v-for="resp in postlist">
                <h5>No Posts</h5>
            </div>
        </div>
       <div id="imagegrid">
            <div v-for="pic in output">
                <img  id="postimages" v-bind:src= "'/static/uploads/'+pic.postimage" class="profile_post">
            </div>
        
        </div>
    </div>
    `,
    watch: {
        '$route' (to, fom){
            this.reload()
        },
        'following' (newvalue, oldvalue){
            this.reload()
        }
      },
    created: function() {
        let self = this;
        let userid = this.$route.params.userid;
        fetch("/api/users/"+userid+"/posts", { 
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
            if(jsonResponse.data){
                self.output = jsonResponse.data;
            }
            })
            .catch(function (error) {
            console.log(error);
        });
        fetch("/api/users/"+userid+"/", { 
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
        fetch("/api/users/"+userid+"/followersnumber", { 
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
        fetch("/api/users/"+userid+"/following", { 
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
            let follow = jsonResponse.following
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
           userposts:[],
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
            let userid = this.$route.params.userid;
            fetch("/api/users/"+userid+"/posts", { 
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
                if(jsonResponse.data){
                    self.output = jsonResponse.data;
                }
                })
                .catch(function (error) {
                console.log(error);
            });
            fetch("/api/users/"+userid+"/", { 
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
            fetch("/api/users/"+userid+"/followersnumber", { 
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
        fetch("/api/users/"+userid+"/following", { 
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
            let follow = jsonResponse.following
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
            let userid = this.$route.params.userid;
            fetch("/api/users/"+userid+"/follow", { 
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
            // display a success message
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
      

/* -----------------------POST---------------------- */
const post = Vue.component('post-form', {
   template: `
    <div >
        <h3 id="posttitle">New Post</h3>
        <div >
            <ul id = "message" class="list">
                <li v-for="resp in response" class="list alert alert-success">
                    {{ resp.message }}
                </li>
                <li v-for="resp in error"class="list alert alert-danger">
                    {{resp.errors[0]}} <br>
                    {{resp.errors[1]}} <br>
                </li>
            </ul>
            
            <form id="postforms" @submit.prevent="makePost" method="POST" enctype="multipart/form-data" >
                <label class="label_bold">Photo</label></br>
                <input type="file" name="postimage"/></br></br>
                
                <label class="label_bold" for="msg">Caption </label></br>
                <textarea type='text' id='username' name='caption' placeholder="Write a caption..."/></textarea></br>
            
                <div class="">
                    <button id="submit" class="btn btn-success" type="submit">Submit</button>
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
            let postforms = document.getElementById('postforms');
            let form_data = new FormData(postforms);
            let userid = localStorage.getItem('userid');
            fetch("/api/users/"+userid+"/posts",{
                method: 'POST',
                body: form_data,
                'headers':{
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
                    self.message = message;
                    alert("Your post has been successfully added!");
                    self.$router.push('/explore');
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


/* -----------------------LOGOUT---------------------- */
const logout = Vue.component('logout-form', {
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
            // display a success message
            console.log(jsonResponse);
            let message = jsonResponse.message;
            if(jsonResponse.message){
                localStorage.removeItem('token');
                localStorage.removeItem('userid');
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
            path: "/users/:userid",
            component: myprofile
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