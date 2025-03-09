
import mongoose, {ConnectOptions} from 'mongoose';

interface ClientOptions extends ConnectOptions{
  serverApi:{
    version: '1',
    strict: boolean,
    deprecationErrors: boolean
  }
}



export default async function connectDB(uri: string, options?: ClientOptions): Promise<void> {

  const defaultOptions: ClientOptions = { 
    serverApi: 
    { 
      version: '1', 
      strict: true, 
      deprecationErrors: true 
    } 
  }

  const mergedOptions: ClientOptions = {...defaultOptions, ...options}
  mongoose.set('strictQuery', false);
  try {
    await mongoose.connect(uri, mergedOptions)
    await mongoose.connection.db?.admin().command({ping: 1} as const)

    console.log("Successfully connected to MongoDB")
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occured'
    console.error(`Error while connecting to MongoDB: ${errorMessage}`)

    throw new Error(`Database connection failed: ${errorMessage}`)
  }
}