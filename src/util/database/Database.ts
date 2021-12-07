import { MongoClient, Db, Collection, Document, WithId } from 'mongodb'
import log4js from 'log4js'

export default class Database {
    private static instance: Database
    private client: MongoClient
    private database!: Db

    private logger: log4js.Logger = log4js.getLogger('Database')

    public constructor(mongodbURI: string) {
        if (mongodbURI === undefined) {
            throw new Error(`ERROR: No connection URI specified!\n
                Please check your 'MONGODB_URI' variale in the respective .env file.`)
        }

        // Initialise MongoDB client
        this.client = new MongoClient(mongodbURI, {
            connectTimeoutMS: 10000,
            ignoreUndefined: false,
        })

        Database.instance = this
    }

    public static getInstance(): Database {
        return Database.instance
    }

    /**
     * Connects client to MongoDB instance
     * @param databaseName name of MongoDB database
     * @returns Promise<void>
     */
    public async connect(databaseName: string): Promise<void> {
        if (databaseName === undefined) {
            throw new Error(`ERROR: No database name specified!\n
                Please check your 'DATABASE' variable in the respective .env file.`)
        }

        try {
            // Connect client to MongoDB instance
            await this.client.connect()

            // Set database scope
            this.database = this.client.db(databaseName)
            this.logger.info(`Successfully connected to MongoDB instance, scope set to '${databaseName}'`)
        } catch (error: any) {
            this.logger.error(error.message)
        }
    }

    /**
     * Returns all existing documents in a collection
     * @param collectionName name of the collection
     * @returns Promise<WithId<Document>[]>
     */
    public async all(collectionName: string): Promise<WithId<Document>[]> {
        if (!(await this.database.listCollections({ name: collectionName }).next())) {
            throw new Error(`ERROR: Specified collection '${collectionName}' does not exist!`)
        }
        return await this.database.collection(collectionName).find({}).toArray()
    }

    /**
     * Returns all documents that match the passed filter
     * @param collectionName name of the collection
     * @param filter filter, used to seleect the documents to get
     * @returns Promise<WithId<Document>[]>
     */
    public async get(collectionName: string, filter: {}): Promise<WithId<Document>[]> {
        if (!(await this.database.listCollections({ name: collectionName }).next())) {
            throw new Error(`ERROR: Specified collection '${collectionName}' does not exist!`)
        }
        return await this.database.collection(collectionName).find(filter).toArray()
    }

    /**
     * Updates all documents that match the passed filter with specified update operations
     * and returns the count of modified documents
     * @param collectionName name of the collection
     * @param filter filter, used to select the documents to update
     * @param update operations to be applied to the documents
     * @returns Promise<number> modified count
     */
    public async update(collectionName: string, filter: {}, update: {}): Promise<number> {
        if (!(await this.database.listCollections({ name: collectionName }).next())) {
            throw new Error(`ERROR: Specified collection '${collectionName}' does not exist!`)
        }
        return (await this.database.collection(collectionName).updateMany(filter, update)).modifiedCount
    }

    /**
     * Deletes all documents that match the passed filter and returns the count of
     * deleted documents
     * @param collectionName name of the collection
     * @param filter filter, used to select the documents to delete
     * @returns Promise<Number> deleted count
     */
    public async delete(collectionName: string, filter: {}): Promise<number> {
        if (!(await this.database.listCollections({ name: collectionName }).next())) {
            throw new Error(`ERROR: Specified collection '${collectionName}' does not exist!`)
        }
        return (await this.database.collection(collectionName).deleteMany(filter)).deletedCount
    }
}