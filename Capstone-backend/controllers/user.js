import User from '../models/User.js';

//Signup endpoint
export const signupUser = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        console.log("Signup attempt:", { fullName, email });

        const existingUser = await User.findOne({ email });  // Changed
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                error: "Email already exists" 
            });
        }

        const newUser = new User({  // Changed
            fullName,
            email,
            password,
            role,  
        });

        await newUser.save();
        console.log("User created successfully:", email);

        res.json({ 
            success: true, 
            message: "User created successfully" 
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

//Signin endpoint
export const signinUser = async (req, res) => {
     try {
        const { email, password, role } = req.body;
        
        const foundUser = await User.findOne({ email });  // Changed to foundUser
        
        if (!foundUser) {  // Changed
            return res.status(401).json({ 
                success: false, 
                error: "Invalid email or password" 
            });
        }
        
        if (foundUser.password !== password) {  // Changed
            return res.status(401).json({ 
                success: false, 
                error: "Invalid email or password" 
            });
        }
        
        const userData = {
            id: foundUser._id,  // Changed
            fullName: foundUser.fullName,  // Changed
            email: foundUser.email,  // Changed
            role: foundUser.role
        };
        
        res.json({ 
            success: true,
            message: "Login successful",
            user: userData
        });
        
    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ 
            success: false, 
            error: "Server error. Please try again."
        });
    }
}

export const registerUser = async (req, res) => {
    try {
        const { email, name, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user',
        });

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        const isMatch = await user.comparePassword(password);

        if(!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }
    } catch ( error ) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
        })
    }
};
