from . import db
from werkzeug.security import generate_password_hash

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    password = db.Column(db.String(80))
    firstname = db.Column(db.String(80))
    lastname = db.Column(db.String(80))
    email = db.Column(db.String(80), unique=True)
    location =  db.Column(db.String(50))
    biography = db.Column(db.Text)
    image = db.Column(db.String(80))
    joined_on = db.Column(db.DateTime)
    
    
    def __init__(self,username,password,firstname,lastname,email,location,biography,image,joined_on):
        self.username = username
        self.password = password
        self.firstname = firstname
        self.lastname = lastname
        self.email = email
        self.location = location
        self.biography = biography
        self.image = image
        self.joined_on = joined_on
    
    def set_password(self, password):
        self.password = generate_password_hash(password)
        
    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        try:
            return unicode(self.id)  # python 2 support
        except NameError:
            return str(self.id)  # python 3 support

    def __repr__(self):
        return '<User %r>' % (self.username)
    
class Posts(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=True)
    postimage = db.Column(db.String(255))
    caption = db.Column(db.Text)
    created_on = db.Column(db.DateTime)

    def __init__(self,user_id,postimage,caption,created_on):
        self.user_id = user_id
        self.postimage = postimage
        self.caption = caption
        self.created_on = created_on
        
class Likes(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    user_id = db.Column(db.Integer,unique=True)
    post_id = db.Column(db.Integer,unique=True)
    
    def __init__(self,user_id,post_id):
        self.user_id = user_id
        self.post_id =post_id
        
class Follows(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer,unique=True)
    follower_id = db.Column(db.Integer,unique=True)    
        
    def __init__(self,user_id,follower_id):
        self.user_id = user_id
        self.follower_id = follower_id
    

    