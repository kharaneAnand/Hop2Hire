import {Kafka} from 'kafkajs' ;
import nodemailer from 'nodemailer' ;
import dotenv from 'dotenv'

dotenv.config();

export const startSendMailConsumer = async()=>{

    try {
        const kafka = new Kafka({
            clientId: 'mail-service',
            brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
         });

         const consumer = kafka.consumer({groupId:"mail-service-group"}) ;
         await consumer.connect() ;

         const topicName = "send-mail" ;
         await consumer.subscribe({ topic:topicName , fromBeginning:false}) ;
         
         console.log("✅ mail service consumer started , listening for sending the mail ") ;

         await consumer.run({
            eachMessage : async({topic , partition , message})=>{
                try {
                    const {to , subject , html} = JSON.parse(
                        message.value?.toString() || "{}" 
                    );

                  const transporter = nodemailer.createTransport({
                  host: "smtp.gmail.com",
                  port :465 ,
                  secure:true ,
                  auth:{
                    user:"xyz",
                    pass:"yzx",
                  }
                  });

                  await transporter.sendMail({
                    from : "HOPE2HIRE <no-reply>",
                    to,
                    subject,
                    html ,
                  })

                  console.log(`Mail has been sent to ${to}`);
                } catch (error) {
                    console.log("Failed to sent the Mail" , error) ;
                }
            },
         });
        
    } catch (error) {
            console.log("Failed to start the kafka consumer") ;
    }
}