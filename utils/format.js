const formatSong = exports.formatSong = (song) => {
    return song ? `${song.name} (${song.artists[0].name})` : ''
}

const formatSongList = exports.formatSongList = (list, options) => {
    const { prefix = '', suffix = '' } = options
    return list.map((song, i) => `${prefix}${i + 1}: ${formatSong(song)}`).join('\n')
}