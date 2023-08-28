export default async function (req, res) {
    global.messages = [];
    res.status(200).json({ result: 'Message log cleared' });
    console.log('Message log cleared');
    return;
}
