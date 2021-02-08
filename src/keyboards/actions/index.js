module.exports = (lastTurnCbData) => [{
//   text: 'Settings',
//   callback_data: 'settings',
// }, {
  text: 'Last turn',
  callback_data: `last${lastTurnCbData ? '::' + lastTurnCbData : ''}`,
}, {
  text: 'New game',
  switch_inline_query_current_chat: '',
}]
