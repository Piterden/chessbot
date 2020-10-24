module.exports = (lastTurnCbData = 'last') => [{
  text: 'Settings',
  callback_data: 'settings',
}, {
  text: 'Last turn',
  callback_data: lastTurnCbData,
}, {
  text: 'New game',
  switch_inline_query_current_chat: '',
}]
