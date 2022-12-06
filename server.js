const http = require('http');
const express = require('express');
const yup = require('yup')

const app = express();
const server = http.createServer(app);

const mongoose = require('mongoose');
const DB_NAME = process.env.DB_NAME || 'jsd_mongoose';
const { Schema } = mongoose;

const emailValidatorSchema = yup.string().email().required()

mongoose.connect(`mongodb://localhost:27017/${DB_NAME}`).catch(err => {
  throw err;
  process.exit(1);
});

const usersSchema = new Schema({
  firstName: {
    type: String,
    required: true, 
    validate:{
      validator: (v)=>{/[A-Za-z]{2,32}/.test(v)}
    }
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    validate:{
      validator: (v)=>emailValidatorSchema.isValid(v)
      
    }
  },
  gender: {
    type: String,
    required: true
  },
  birthday: {
    type: Date
  }
});
const User = mongoose.model('User', usersSchema);

const postSchema = new Schema({
  body: {
      type: String,
      required: true
  },
  imgSrc: String,
  author:{ 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
  }
});

const Post = mongoose.model('Post', postSchema)





app.use(express.json());

app.post('/', async (req, res, next) => {
  try {
    const { body } = req;
    const createdUser = await User.create(body);
    res.send(createdUser);
  } catch (err) {
    next(err);
  }
});
app.get('/', async (req, res, next) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {}
});
app.patch('/:userId', async (req, res, next) => {
  try {
    const { body, params:{userId} } = req;
    const updatedUser = await User.findOneAndUpdate({_id:userId}, body, {
      returnDocument: 'after'
    });
    res.send(updatedUser);
  } catch (err) {
    next(err);
  }
});
app.delete('/:userId', async (req, res, next) => {
  try {
    const { params:{userId}} = req;
    const deletedUser = await User.findByIdAndDelete(userId);
    if(!deletedUser){
      res.status(404).send('User not found')
    }
    res.send(deletedUser);
  } catch (err) {
    next(err);
  }
});

//crud for posts
app.post('/:userId/posts', async (req, res, next) => {
  try {
    const { body, params:{userId} } = req;
    const createdPost = await Post.create({...body, author: userId});
    res.send(createdPost);
  } catch (err) {
    next(err);
  }
});
app.get('/posts', async (req, res, next) => {
    Post
    .find()
    .populate('author')
    .exec(
        (err, posts) => {
            if (err) {
                throw err
            }
            res.send(posts)
        })
});
app.get('/:userId/posts', async (req, res, next) => {
  try{
  const {params: {userId}} = req
  const userPosts = await Post.find({author:userId})
    res.send(userPosts)
  }catch(err){
    next(err)
  }
});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`${PORT}`);
});
