"""
Flask Documentation:     http://flask.pocoo.org/docs/
Jinja2 Documentation:    http://jinja.pocoo.org/2/documentation/
Werkzeug Documentation:  http://werkzeug.pocoo.org/documentation/
This file creates your application.
"""

import os
from app import app,db,filefolder,token_key
from flask import render_template, request, redirect, url_for, flash, g,jsonify,session,abort
import os, datetime
from flask_login import login_user, logout_user, current_user, login_required
from forms import SignUpForm,LoginForm,PostForm
from functools import wraps
from models import Users, Posts, Likes, Follows
from werkzeug.utils import secure_filename
from app.models import Users,Posts, Follows, Likes
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps


###
# Routing for your application.
###

#***************************************FRONT END ROUTES************************************

#---------------------------------------AUTHENTICATION-----------------------------------------
def requires_auth(f):
  @wraps(f)
  def decorated(*args, **kwargs):
    auth = request.headers.get('Authorization', None)
    if not auth:
      return jsonify({'code': 'authorization_header_missing', 'description': 'Authorization header is expected'}), 401

    parts = auth.split()

    if parts[0].lower() != 'bearer':
      return jsonify({'code': 'invalid_header', 'description': 'Authorization header must start with Bearer'}), 401
    elif len(parts) == 1:
      return jsonify({'code': 'invalid_header', 'description': 'Token not found'}), 401
    elif len(parts) > 2:
      return jsonify({'code': 'invalid_header', 'description': 'Authorization header must be Bearer + \s + token'}), 401

    token = parts[1]
    try:
         payload = jwt.decode(token, token_key)
         get_user = Users.query.filter_by(id=payload['user_id']).first()

    except jwt.ExpiredSignature:
        return jsonify({'code': 'token_expired', 'description': 'token is expired'}), 401
    except jwt.DecodeError:
        return jsonify({'code': 'token_invalid_signature', 'description': 'Token signature is invalid'}), 401

    g.current_user = user = get_user
    return f(*args, **kwargs)

  return decorated

#----------------------------------------INDEX---------------------------------------------
@app.route('/')
def index():
    initial_form = SignUpForm()
    """Render website's initial page and let VueJS take over."""
    return render_template('index.html', initial_form = initial_form)
    
    
#-----------------------------------------LOGIN-------------------------------------------  
@app.route('/api/auth/login', methods=["POST"])
def login():
    form = LoginForm()
    if request.method == "POST" and form.validate_on_submit():
        username = request.form['username']
        password = request.form['password']
        
        user = Users.query.filter_by(username = username).first()
        
        if user and check_password_hash(user.password, password): 
            payload = {'user_id' : user.id}
            token = jwt.encode(payload, token_key)
            session['userid'] = user.id;
            return jsonify(data={'token': token, 'userid': user.id}, message="User successfully logged in")
        else:
             return jsonify(errorm="Incorrect username or password")
            
    error_msgs = form_errors(form)
    error = [{'errors': error_msgs}]
    return jsonify(errors=error)
        
       
 #----------------------------------------LOGOUT------------------------------------------      
@app.route('/api/auth/logout', methods = ['GET'])
@requires_auth
def logout():
    g.current_user = None
    session.pop('userid', None)
    return jsonify(message = "User successfully logged out")
    
    
#----------------------------------------REGISTER------------------------------------------
@app.route('/api/users/register', methods = ['POST'])
def register():
    form = SignUpForm()
    
    if request.method == 'POST' and form.validate_on_submit():
        firstname = request.form['firstname']
        lastname = request.form['lastname']
        username = request.form['username']
        password = generate_password_hash(request.form['password'])
        location = request.form['location']
        email = request.form['email']
        bio = request.form['biography']
        image = request.files['image']
        profile_created_on = datetime.datetime.now()
        filename = secure_filename(image.filename)
        image.save(os.path.join(filefolder, filename))
        
        user = Users(username = username, password = password, firstname = firstname, lastname = lastname, email = email,location = location, biography = bio, image = filename, joined_on = profile_created_on)
    
        db.session.add(user)
        db.session.commit()
    
        response = [{'message': 'User has been successfully registered'}]
        return jsonify(result = response)
    error_msgs = form_errors(form)
    error = [{'errors': error_msgs}]
    return jsonify(errors =error)


#--------------------------------------------POSTS-------------------------------------------
@app.route('/api/posts/', methods=["GET"])
@requires_auth
def show_all_posts():
    all_posts = Posts.query.order_by(Posts.created_on.desc()).all()
    postlist = []
    for post in all_posts:
        user = Users.query.filter_by(id = post.user_id).first()
        likes = Likes.query.filter_by(post_id = post.id).all()
        likescount = [];
        for like in likes:
            count = {'test': "counted"}
            likescount.append(count)
        liked_post = Likes.query.filter_by(user_id = session['userid'], post_id= post.id).first()
        if(liked_post is None):
            likeflag = False
        else:
            likeflag = True
        postdate= post.created_on.strftime("%d %b %Y");
        posted = {"postid":post.id,"userid": post.user_id, "username": user.username, "profilephoto": user.image, "photo": post.postimage, "caption": post.caption, "created_on": postdate, "likes": likescount, "likeflag": likeflag}
        postlist.append(posted)
    return jsonify(data= post)
        

#------------------------------------USER POSTS----------------------------------------------
@app.route('/api/users/<user_id>/posts',methods=["GET","POST"])
@requires_auth
def add_post(user_id):
    form = PostForm()
    if request.method == "POST":
        if form.validate_on_submit():
            userid = user_id
            caption = request.form['caption']
            photo  = request.files['postimage']
            post_date = datetime.datetime.now()
            
            post_photo = secure_filename(photo.filename)
            post = Posts(user_id = userid, postimage = post_photo, caption = caption, created_on = post_date)
            
            db.session.add(post)
            db.session.commit()
            
            photo.save(os.path.join(filefolder, post_photo))
            return jsonify({'message':"Successfully created a new post"})
            
    elif request.method == "GET":
        user = Users.query.filter_by(id = user_id).first()
        if not user:
            return jsonify({'message': "no user found"})
        user_posts = Posts.query.filter_by(user_id = user_id).all()
        
        userposts = []
        for user_post in user_posts:
            post_data = {'id':user_post.id,'user_id': user_post.user_id,'postimage': user_post.post_photo,'caption': user_post.caption,'created_on': user_post.post_date}
            userposts.append(post_data)
        return jsonify(data = userposts)
    error_msgs = form_errors(form)
    error = [{'errors': error_msgs}]
    return jsonify(errors = error)


#------------------------------------------USER----------------------------------------------
@app.route('/api/users/<user_id>/', methods=["GET"])
@requires_auth
def get_user(user_id):
    user = Users.query.filter_by(id = user_id).first()
    userlist = []
    if (int(user_id) == session['userid']):
        date_join = user.joined_on.strftime("%B %Y");
        user_info = {"userid": user.id, "username": user.username, "firstname": user.firstname, "lastname": user.lastname, "email": user.email, "location": user.location, "biography": user.biography,"photo": user.image, "joined_on": date_join}
        userlist.append(user_info)
        return jsonify(profile = userlist, isuser = True)
    date_join = user.joined_on.strftime("%B %Y");
    user_info = {"userid": user.id, "username": user.username, "firstname": user.firstname, "lastname": user.lastname, "email": user.email, "location": user.location, "biography": user.biography,"photo": user.image, "joined_on": date_join}
    userlist.append(user_info)
    return jsonify(profile = user_list)



#-------------------------------------------LIKE--------------------------------------------
@app.route('/api/users/<post_id>/like',methods=["POST"])
@requires_auth
def like_post(post_id):
    like_check = Likes.query.filter_by(user_id = session['userid'], post_id = post_id).first()
    if(like_check is None):
        like = Likes(user_id = session['userid'], post_id = post_id)
        db.session.add(like)
        db.session.commit()
        return jsonify (message= 'Post liked!')
    return jsonify (DB = 'Cannot like post again!')
    
    

#------------------------------------FOLLOW--------------------------------------------------
@app.route('/api/users/<user_id>/followers',methods=["GET"])
@requires_auth
def followers(user_id):
    followers_count = Follows.query.filter_by(user_id = user_id).all()
    number_of_followers = []
    for count in followers_count:
        num = {'test': "counted"}
        number_of_followers.append(num)
    return jsonify (follower = number_of_followers)
    
@app.route('/api/users/<user_id>/following',methods=["GET"])
@requires_auth
def followers_check(user_id):
    follow_check = Follows.query.filter_by(user_id = user_id, follower_id = session['userid']).first()
    if(follow_check is None):
        return jsonify (following = False)
    return jsonify (following = True)
    
@app.route('/api/users/<user_id>/follow',methods=["POST"])
@requires_auth
def follow_user(user_id):
    follow = Follows(user_id = user_id, follower_id = session['userid'])
    db.session.add(follow)
    db.session.commit()
    return jsonify (message = 'you are now following this user!')
    

#-------------------------------OTHER USEFUL ROUTES--------------------------------------
# Here we define a function to collect form errors from Flask-WTF
# which we can later use
def form_errors(form):
    error_messages = []
    """Collects form errors"""
    for field, errors in form.errors.items():
        for error in errors:
            message = u"Error in the %s field - %s" % (
                    getattr(form, field).label.text,
                    error
                )
            error_messages.append(message)

    return error_messages


###
# The functions below should be applicable to all Flask apps.
###
def dictify(data_object):
    """
    Returns a dictionary containing the attributes and thier values
    for an object returned from a DB query
    """
    key_value_pairs   = data_object.__dict__.items()
    object_dictionary = {}
    
    for key,value in key_value_pairs:
        if not key == '_sa_instance_state':
        #All db ojects will have this but we do not need it here
        # for example: ('_sa_instance_state', <sqlalchemy.orm.state.InstanceState object at 0x7f6696d831d0>)
            object_dictionary[key] = value
    return object_dictionary


def flash_errors(form):
    for field, errors in form.errors.items():
        for error in errors:
            flash(u"Error in the %s field - %s" % (
                getattr(form, field).label.text,
                error), 'danger')

@app.route('/<file_name>.txt')
def send_text_file(file_name):
    """Send your static text file."""
    file_dot_text = file_name + '.txt'
    return app.send_static_file(file_dot_text)


@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also tell the browser not to cache the rendered page. If we wanted
    to we could change max-age to 600 seconds which would be 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control']   = 'public, max-age=0'
    return response


@app.errorhandler(404)
def page_not_found(error):
    """Custom 404 page."""
    return render_template('404.html'), 404


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port="8080")
