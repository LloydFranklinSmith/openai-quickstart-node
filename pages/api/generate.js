
import OpenAI from "openai";

const configuration = {
  apiKey: process.env.OPENAI_API_KEY,
};
const openai = new OpenAI(configuration);
//todo use env variable
const dummyMode = false; //process.env.DUMMY_MODE === 'true';


export default async function (req, res) {
  if(!global.testCounter) {
    global.testCounter = 0;
  }
  global.testCounter++;
  console.log('testCounter', global.testCounter);
  if (dummyMode) {

    res.status(200).json({ result: 'Dummy mode, returning early' });
    console.log('Dummy mode, returning early');
    return;
  }

  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const userMessage = req.body.userMessage || '';
  if (userMessage.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "ERROR: No text to act upon."
      }
    });
    return;
  }

  try {

    const functions = [
      {
        name: 'set_hex_color',
        description: 'sets the hex color of the mood along with a small uplifting message related to the color an the mood',
        parameters: {
          type: 'object',
          properties: {
            hex_color: {
              type: 'string',
              description: 'the hex color of the mood'
            },
            upliftingMessage: {
              type: 'string',
              description: 'a small uplifting message related to the color an the mood that also mentions how it changed'
            }
          },
          required: ['hex_color', 'upliftingMessage']
        }

      },
      {
        name: 'set_flavour_text',
        descritopn: 'sets text explaining the mood color chosen',
        parameters: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'the text explaining the mood color chosen and how the mood has changed'
            }
          }
        }

      }

    ];
    
    //store the user message
    storeMessage('user', userMessage);
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.6,
      messages: retrievePreviousMessages(),
      functions: functions
    });

    console.log(JSON.stringify(chatCompletion));
    //store the response
    var responseText = buildResponse(chatCompletion);
    storeMessage('assistant',responseText);
    res.status(200).json({ result: responseText});

  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}


function storeMessage(role, message){
//init global array if not set
  if(!global.messages) {
    global.messages = [];
    global.messages.push( { "role": "user", content: "Please evaluate the following messages and supply a fitting mood color." });
  }
  //add message to global array
  global.messages.push({role: role, content: message});

}

function retrievePreviousMessages(){
  console.log( global.messages||[]);
  return global.messages||[];
}

function buildResponse(result) {
  var messagetext='';
  //get the first choice message
  const message = result.choices[0].message;
  //get the function call
  const functionCall = message.function_call;
  //use hex color and uplifting message if set
  if (functionCall) {
    console.log(typeof functionCall.arguments);
    console.log( functionCall.arguments);
    const args =JSON.parse(functionCall.arguments) ;
    const hexColor = args.hex_color;
    const upliftingMessage = args.upliftingMessage;
   messagetext = args.upliftingMessage + ' ' + args.hex_color.toString(16);
  } else {
    messagetext += `___ ${message.role}: ${message.content}`;
  }


  return messagetext;
}


function generatePrompt(userMessage) {
  return userMessage;
  const capitalizedAnimal =
    animal[0].toUpperCase() + animal.slice(1).toLowerCase();
  return `Suggest three names for an animal that is a superhero.
Animal:Rasish
Names:This is not animal but how about Rasish the Great, Rasish the Magnificent, Rasish the Powerful
Animal:Jerry
Names:That animal already has a name
Animal: Cat
Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
Animal: Dog
Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
Animal: ${capitalizedAnimal}
Names:`;
}
