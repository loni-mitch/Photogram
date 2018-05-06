
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SelectField, TextAreaField, validators, ValidationError
from wtforms.validators import InputRequired, Required, Email
from flask_wtf.file import FileField, FileAllowed, FileRequired 

class SignUpForm(FlaskForm):
    firstname = StringField('Firstname', [validators.Required("(Required)")])
    lastname  = StringField('Lastname', [validators.Required("(Required)")])
    username  = StringField('Username', [validators.Required("(Required)")])
    password  = PasswordField('Password', validators=[InputRequired()])
    location  = StringField("Location",[validators.Required("(Required)")])
    email     = StringField("Email",[validators.Required("(Required)"), validators.Email("(Required)")])
    biography = TextAreaField('Biography', validators=[InputRequired()])
    image     = FileField('Photo', validators=[FileRequired(), FileAllowed(['jpg','png','jpeg'], 'Only image files accepted.')])
    
class LoginForm(FlaskForm):
    username = StringField('Username', validators=[InputRequired()])
    password = PasswordField('Password', validators=[InputRequired()])

class PostForm(FlaskForm):
    postimage = FileField('Photo', validators=[FileRequired(), FileAllowed(['jpg','png','jpeg'], 'Images only!')])
    caption   = TextAreaField('Caption', validators=[InputRequired()])
