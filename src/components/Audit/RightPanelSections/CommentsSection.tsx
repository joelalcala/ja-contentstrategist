import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

export function CommentsSection() {
  const [comments, setComments] = useState<{ id: number; text: string; timestamp: Date }[]>([])
  const [newComment, setNewComment] = useState("")

  const addComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { id: Date.now(), text: newComment, timestamp: new Date() }])
      setNewComment("")
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Comments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-muted p-2 rounded-lg">
              <p className="text-xs">{comment.text}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {comment.timestamp.toLocaleString()}
              </p>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="text-xs h-7"
            />
            <Button onClick={addComment} size="sm" className="h-7 text-xs">
              <Send className="w-3 h-3 mr-1" />
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}