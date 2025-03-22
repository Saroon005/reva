from pymongo import MongoClient
import datetime

# MongoDB connection string
mongo_uri = "mongodb+srv://bossutkarsh30:YOCczedaElKny6Dd@cluster0.gixba.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Connect to MongoDB
client = MongoClient(mongo_uri)
db = client["alzheimers_db"]
conversation_collection = db["conversation"]

# The conversation data directly as an object
conversation_data = [
    {"text": "Good morning, Sarah. I wanted to discuss our quarterly performance. We've exceeded targets, especially in new markets.", "timestamp": "2025-03-20T09:30:00.000000"},
    {"text": "Good morning, Michael. Our revenue reached $2.4M, a 15% increase. Strategic partnerships and marketing contributed significantly.", "timestamp": "2025-03-20T09:30:15.000000"},
    {"text": "That's impressive.", "timestamp": "2025-03-20T09:31:50.000000"},
    {"text": "The team did great. Our customer-focused product strategy played a key role. Should I prepare a presentation for next week?", "timestamp": "2025-03-21T10:15:00.000000"}
]
# Create the document to insert
conversation_document = {
    "patient_id": "2b21eca3-e66e-4c4c-b539-d1be28726152",
    "known_person_id": "NewPerson_20250321_143702",
    "conversation": conversation_data,
    "last_updated": datetime.datetime.now()
}

# Check if a conversation already exists for this patient and known person
existing_conversation = conversation_collection.find_one({
    "patient_id": conversation_document["patient_id"],
    "known_person_id": conversation_document["known_person_id"]
})

if existing_conversation:
    # Update existing conversation
    result = conversation_collection.update_one(
        {
            "patient_id": conversation_document["patient_id"],
            "known_person_id": conversation_document["known_person_id"]
        },
        {"$set": conversation_document}
    )
    print(f"Updated existing conversation: {result.modified_count} document modified")
else:
    # Insert new conversation
    result = conversation_collection.insert_one(conversation_document)
    print(f"Inserted new conversation with ID: {result.inserted_id}")

# Print confirmation
print(f"Conversation data for patient {conversation_document['patient_id']} and known person {conversation_document['known_person_id']} has been added to the database.")

# Close the connection
client.close()