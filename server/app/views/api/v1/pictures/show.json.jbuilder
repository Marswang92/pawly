json.pictureId @pic.id
json.image @pic.image.url
json.timestamp @pic.created_at
json.creator do
  json.id @pic.creator.id
  json.username @pic.creator.username
  json.avatar @pic.creator.avatar.url
  json.facebookId @pic.creator.facebook_id
end
json.liked @user.liked?(@pic)
json.pets(@pic.pets) do |pet|
  json.id pet.id
  json.name pet.name
  json.avatar pet.avatar.url
  json.isRescue pet.is_rescue
end
if @pic.place.present?
  json.place do |place|
    json.placeId @pic.place.id
    json.name @pic.place.name
    json.latitude @pic.place.latitude
    json.longitude @pic.place.longitude
  end
end
json.caption @pic.caption
json.likers(@pic.likers) do |liker|
  json.username liker.username
end
json.comments(@pic.comments.order('created_at ASC')) do |comment|
  json.id comment.id
  json.author do
    json.id comment.author.id
    json.username comment.author.username
    json.facebookId comment.author.facebook_id
    json.avatar comment.author.avatar.url
  end
  json.body comment.body
  json.createdAt comment.created_at
  if comment.target.present?
    json.target do
      json.id comment.target.id
      json.username comment.target.username
      json.avatar comment.target.avatar.url
    end
  end
end
json.likerLength @pic.likers.length
json.commentLength @pic.comments.length
