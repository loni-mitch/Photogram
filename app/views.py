"""
Flask Documentation:     http://flask.pocoo.org/docs/
Jinja2 Documentation:    http://jinja.pocoo.org/2/documentation/
Werkzeug Documentation:  http://werkzeug.pocoo.org/documentation/
This file creates your application.
"""

import os
from app import app,db,filefolder,token_key
from flask import render_template, request, redirect, url_for, flash, jsonify,session,abort
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

#-------------------FRONT END ROUTES-----------------------

def jwt_token_required(fn):
    @wraps(fn)
    def decorated(*args,**kwargs):
        jwt_token = request.headers.get('Authorization')
        if jwt_token == None:
            return jsonify({'error':'ACCESS DENIED: No token provided'})
        else:
            try:
                user_data  = jwt.decode(jwt_token.split(" ")[1],app.config['SECRET_KEY'])
                current_user = Users.query.filter_by(username = user_data['user']).first()
            except jwt.exceptions.InvalidSignatureError:
                return jsonify({'error':'ACCESS DENIED: Invalid Token'})
            except jwt.exceptions.DecodeError:
                return jsonify({'error':'ACCESS DENIED: Invalid Token'})
            return fn(current_user,*args,**kwargs)
    return decorated


@app.route('/')
def index():
    initial_form = SignUpForm()
    """Render website's initial page and let VueJS take over."""
    return render_template('index.html', initial_form = initial_form)
    
@app.route('/api/auth/login', methods = ['POST'])
def login():
    loginform = LoginForm()
    if request.method == 'POST' and loginform.validate_on_submit():
        username = request.form['username']
        password = request.form['password']
        user = Users.query.filter_by(username=username,password=password).first()
        
        
        if len(users) == 0:
            return jsonify({'error':'Invalid username'})
        elif not check_password_hash(users[0].password,password):
            return jsonify({'error':'Invalid password'})
        else:
            user = users[0]
            jwt_token = jwt.encode({'user': user.username}, app.config['SECRET KEY'], algorithm = 'HS256')
            response = {'message':'User successfully logged in','jwt_token':jwt_token,'current_user':user.id}
            return jsonify(response)
        
    error_msgs = form_errors(loginform)
    error = [{'errors': error_msgs}]
    return jsonify(errors=error)
            
            
            
@app.route('/api/auth/logout', methods = ['GET'])
@jwt_token_required
def logout():
    g.current_user = None
    session.pop('userid', None)
    return jsonify({'message': 'User successfully logged out'})


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
    return jsonify(errors=error)

@app.route('/api/users/<user_id>/posts',methods=["GET","POST"])
@jwt_token_required
def post(user_id):
    form = PostForm()
    if request.method == "POST":
        if form.validate_on_submit():
            userID = user_id
            caption = request.form['caption']
            photo  = request.files['postimage']
            date = datetime.datetime.now()
            
            picture = secure_filename(postimage.filename)
            post = Posts(user_id = userID, postimage = picture, caption = caption, created_on = date)
            
            db.session.add(post)
            db.session.commit()
            
            postimage.save(os.path.join(filefolder, post_picture))
            return jsonify({'message':"Successfully created a new post"})
            
    elif request.method == "GET":
        user = Users.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({'message': "no user found"})
        user_posts = Posts.query.filter_by(userID=user_id).all()
        output = []
        for user_post in user_posts:
            post_info = {'id':user_post.id,'user_id': user_post.userID,'postimage': user_post.photo,'caption': user_post.caption,'created_on': user_post.created_on}
            output.append(post_info)
        return jsonify(data=output)
    error_msgs = form_errors(form)
    error = [{'errors': error_msgs}]
    return jsonify(errors=error)

@app.route('/api/posts',methods = ['GET'])
@jwt_token_required
def show_posts():
    if request.method == 'GET':
        posts_all = Posts.query.order_by(Posts.created_on.desc()).all()
        post_list = []
        
        
        for post in posts_all:
            user = Users.query.filter_by(id = post['userid']).first()
            likes = Likes.query.filter_by(postid = post['id']).all()
            likescount = []
            for count in likes:
                num = {'test': "counted"}
                likescount.append(num)
            liked_post = Likes.query.filter_by(userID=session['userid'], postID= post.id).first()
            if(liked_post is None):
                likeflag = False
            else:
                likeflag = True
            postdate= post.created_on.strftime("%d %b %Y");
            posted= {"postid":post.id,"userid": post.userID, "username": user.username, "pro_photo": user.image, "photo": post.postimage, "caption": post.caption, "created_on": postdate, "likes": likescount, "likeflag": likeflag}
            post_list.append(posted)
        return jsonify(data = post_list)
        
@app.route('/api/users/<post_id>/like',methods=['POST'])
@jwt_token_required
def like(current_user,post_id):
    post = Posts.query.filter_by(id = post_id).first()
    
    if post == None:
        return jsonify({'error':'Post not found'})
    
    if request.method == 'POST':
        like = Likes.query.filter_by(postid = post_id,userid = current_user.id).first()
        
        if like  == None:
            like = Likes(post_id =post_id,user_id = current_user)
            db.session.add(like)
            db.session.commit()
            likes_number = len(Likes.query.filter_by(post_id = post_id).all())
            return jsonify({'message':'You liked this post.','Likes': likes_number})
        likes_number=len(Likes.query.filter_by(postid = post_id).all())
        return jsonify({'message': 'Post already liked','likes':likes_number})


@app.route('/api/users/<user_id>/like',methods = ['GET'])
@jwt_token_required
def liked_posts(current_user,user_id):
    """
    Returns a list of posts liked by the user with user id
    """
    user    = Users.query.filter_by(id = user_id).first()
    user_id = current_user.id
    
    if user == None:
        return jsonify({['User does not exist']})
    
    liked_posts = Likes.query.filter_by(userid = user_id).all()
    post_list = [dictify(post) for post in liked_posts] 
    return jsonify({'liked_posts':post_list})
    
@app.route('/api/users/<users_id>/follow', methods = ['POST'])
@jwt_token_required
def follow(current_user,user_id):
    user = db.Users.query.filter_by(id = user_id).first()
    
    if user == None:
        return jsonify({'error':'User not found'})
    
    if request.method == 'POST':
        user_id = request.valuest.get('')
        follower_id = request.valuest.get('')
        follow_link = Follows(follower_id = follower_id, user_id = user_id)
        db.session.add(follow_link)
        db.session.commit()
        response = {'message':'You followed this user'}
        return jsonify(response)
    
@app.route('/api/users/<user_id>/followers', methods = ['GET'])
@jwt_token_required
def follower_number(current_user,user_id):
    user = Users.query.filter_by(id = user_id).first()
    if user == None:
        return jsonify_errors(['User not found'])
        
    if request.method == 'GET':
        followers = len(Follows.query.filter_by(user_id = user_id).all())
        return jsonify({'followers':followers})

@app.route('/api/users/<user_id>/following',methods = ['GET'])
@jwt_token_required
def is_following(current_user,user_id):
    user = Users.query.filter_by(id = user_id).first()
    
    if user == None:
        return jsonify({'error':'This user does not exist'})
    follow = Follows.query.filter_by(user_id = user_id,follower_id = current_user.id).first()
    
    if follow == None:
        return jsonify({'following':False})
    else:
        return jsonify({'following':True})
    



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
